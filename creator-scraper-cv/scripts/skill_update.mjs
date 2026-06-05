#!/usr/bin/env node
// Check and update this skill from a remote manifest.
//
// Usage:
//   node scripts/skill_update.mjs --check
//   node scripts/skill_update.mjs --yes
//
// Required:
//   CV_SKILL_UPDATE_MANIFEST_URL=https://.../creator-scraper-cv.manifest.json
//
// Manifest shape:
// {
//   "name": "creator-scraper-cv",
//   "latest_version": "0.9.1",
//   "min_supported_version": "0.8.0",
//   "release_notes": ["..."],
//   "files": [
//     {"path": "SKILL.md", "url": "https://...", "sha256": "..."}
//   ]
// }

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, normalize, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const skillRoot = resolve(scriptDir, '..');
const skillMetaPath = join(skillRoot, 'skill.json');
const skillMdPath = join(skillRoot, 'SKILL.md');
const defaultManifestUrl = 'https://raw.githubusercontent.com/creativault/skills/main/creator-scraper-cv/skill-manifest.json';

function readJSON(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function readSkillVersionFromMarkdown() {
  try {
    const skillMd = readFileSync(skillMdPath, 'utf8');
    const versionMatch = skillMd.match(/version:\s*"?([^"\n]+)"?/);
    return versionMatch?.[1]?.trim() || 'unknown';
  } catch {
    return 'unknown';
  }
}

function readSkillMeta() {
  if (existsSync(skillMetaPath)) {
    return readJSON(skillMetaPath);
  }
  return {
    name: 'creator-scraper-cv',
    version: readSkillVersionFromMarkdown(),
    channel: 'stable',
    update: {
      manifest_url: defaultManifestUrl,
      manifest_url_env: 'CV_SKILL_UPDATE_MANIFEST_URL',
      auto_update_env: 'CV_SKILL_AUTO_UPDATE',
    },
  };
}

function compareVersion(a, b) {
  const left = String(a || '0').split('.').map((part) => Number.parseInt(part, 10) || 0);
  const right = String(b || '0').split('.').map((part) => Number.parseInt(part, 10) || 0);
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const diff = (left[index] || 0) - (right[index] || 0);
    if (diff !== 0) return diff > 0 ? 1 : -1;
  }
  return 0;
}

function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

function assertSafeRelativePath(path) {
  const normalized = normalize(path);
  if (
    !normalized ||
    isAbsolute(normalized) ||
    normalized.startsWith('..') ||
    normalized.includes(`..\\`) ||
    normalized.includes('../') ||
    resolve(skillRoot, normalized) === skillRoot
  ) {
    throw new Error(`Unsafe manifest file path: ${path}`);
  }
  return normalized;
}

async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch manifest: HTTP ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch file: HTTP ${response.status} ${response.statusText} (${url})`);
  }
  return response.text();
}

function getManifestUrl(meta) {
  const envName = meta.update?.manifest_url_env || 'CV_SKILL_UPDATE_MANIFEST_URL';
  return process.env[envName] || meta.update?.manifest_url || defaultManifestUrl;
}

function shouldUpdate(meta, manifest) {
  return compareVersion(meta.version, manifest.latest_version) < 0;
}

function printResult(result) {
  console.log(JSON.stringify(result, null, 2));
}

async function check() {
  const meta = readSkillMeta();
  const manifestUrl = getManifestUrl(meta);
  if (!manifestUrl) {
    return {
      ok: false,
      error: 'Missing update manifest URL',
      hint: `Set ${meta.update?.manifest_url_env || 'CV_SKILL_UPDATE_MANIFEST_URL'} to your published skill manifest URL.`,
      current_version: meta.version,
    };
  }

  const manifest = await fetchJSON(manifestUrl);
  if (manifest.name && manifest.name !== meta.name) {
    throw new Error(`Manifest skill name mismatch: expected ${meta.name}, got ${manifest.name}`);
  }

  const updateAvailable = shouldUpdate(meta, manifest);
  const updateRequired = manifest.min_supported_version
    ? compareVersion(meta.version, manifest.min_supported_version) < 0
    : false;

  return {
    ok: true,
    skill: meta.name,
    current_version: meta.version,
    latest_version: manifest.latest_version,
    min_supported_version: manifest.min_supported_version || null,
    update_available: updateAvailable,
    update_required: updateRequired,
    release_notes: manifest.release_notes || [],
    manifest_url: manifestUrl,
    manifest,
  };
}

async function update({ dryRun = false } = {}) {
  const result = await check();
  if (!result.ok) return result;
  if (!result.update_available) return result;

  const { manifest } = result;
  if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
    throw new Error('Manifest must include a non-empty files array for automatic update.');
  }

  const staged = [];
  for (const file of manifest.files) {
    const relativePath = assertSafeRelativePath(file.path);
    const text = await fetchText(file.url);
    if (file.sha256 && sha256(text) !== file.sha256) {
      throw new Error(`Checksum mismatch for ${relativePath}`);
    }
    staged.push({ relativePath, text });
  }

  if (dryRun) {
    return {
      ...result,
      dry_run: true,
      file_count: staged.length,
    };
  }

  const backupRoot = join(skillRoot, '.skill-backups', new Date().toISOString().replace(/[:.]/g, '-'));
  for (const item of staged) {
    const target = join(skillRoot, item.relativePath);
    const backup = join(backupRoot, item.relativePath);
    mkdirSync(dirname(target), { recursive: true });
    if (existsSync(target)) {
      mkdirSync(dirname(backup), { recursive: true });
      renameSync(target, backup);
    }
    writeFileSync(target, item.text, 'utf8');
  }

  return {
    ...result,
    updated: true,
    file_count: staged.length,
    backup_dir: relative(skillRoot, backupRoot),
  };
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const yes = args.has('--yes') || process.env.CV_SKILL_AUTO_UPDATE === 'true';
  const dryRun = args.has('--dry-run');
  const checkOnly = args.has('--check') || (!yes && !dryRun);

  const result = checkOnly ? await check() : await update({ dryRun });
  printResult(result);

  if (result.ok && result.update_required && !yes) {
    process.exitCode = 2;
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exit(1);
});
