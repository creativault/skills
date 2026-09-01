// Navos runtime credentials for the App Ranking skill.
// Navos users exchange their desktop uid/token for a CV API key and never need
// to configure CV_API_KEY manually (except an explicit debugging override).

import { createHash, randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

const SKILL_CHANNEL = 'stable';
const CACHE_FILE = join(process.env.CV_CREDENTIALS_DIR || join(homedir(), '.creativault'), 'skill-credentials.json');
const NAVOS_CN_BASE_URL = 'https://navos-mind-server-vip-gz.tec-do.com';
const NAVOS_GLOBAL_BASE_URL = 'https://navos-mind-server-vip.tec-do.com';
const NAVOS_BALANCE_PATH = '/api/v1/balancebatch/external/query/balance';
const DEFAULT_BALANCE_TOKEN = 'ext_bq_2H9aLpQz6mKvR3sN';

function readJson(path, fallback = {}) {
  try {
    return JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
  } catch {
    return fallback;
  }
}

function normalizeProfile(value) {
  const profile = String(value || '').trim().toLowerCase();
  return profile === 'navos' ? 'navos-global' : profile || 'common';
}

function identityPath() {
  return (process.env.NAVOS_IDENTITY_FILE || '').trim()
    || join(homedir(), '.navos', 'identity', 'navos-userinfo.json');
}

function loadNavosIdentity() {
  const uid = (process.env.NAVOS_UID || '').trim();
  const token = (process.env.NAVOS_TOKEN || '').trim();
  if (uid && token) {
    return { uid, token, email: (process.env.NAVOS_EMAIL || '').trim() || `${uid}@navos.local` };
  }

  const path = identityPath();
  if (!existsSync(path)) {
    throw new Error('Navos identity not found. Please log in to Navos first.');
  }
  const identity = readJson(path, null);
  if (!identity?.uid || !identity?.token) {
    throw new Error('Navos identity is missing uid or token. Please re-login to Navos.');
  }
  return {
    uid: String(identity.uid).trim(),
    token: String(identity.token).trim(),
    email: String(identity.email || `${identity.uid}@navos.local`).trim(),
  };
}

export function loadRuntimeProfile() {
  const explicit = normalizeProfile(process.env.CV_SKILL_PROFILE);
  if (process.env.CV_SKILL_PROFILE) return explicit;

  const identity = readJson(identityPath(), {});
  const fromNavos = normalizeProfile(identity?.app_id);
  return ['navos-cn', 'navos-global'].includes(fromNavos) ? fromNavos : 'common';
}

function isNavosProfile(profile) {
  return profile === 'navos-cn' || profile === 'navos-global';
}

function cacheKey(partnerCode, cvBase, uid) {
  const host = new URL(cvBase).host.toLowerCase().replace(/[^a-z0-9.-]/g, '_');
  return `${partnerCode}:${SKILL_CHANNEL}@${host}:${uid}`;
}

function readCache() {
  return readJson(CACHE_FILE, {});
}

function writeCache(cache) {
  const dir = dirname(CACHE_FILE);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
}

function partnerHeaders(partnerCode, region) {
  return {
    'Content-Type': 'application/json',
    'X-Partner-Code': partnerCode,
    'X-Timestamp': String(Math.floor(Date.now() / 1000)),
    'X-Nonce': randomBytes(16).toString('hex'),
    'X-Navos-Region': region,
  };
}

async function partnerRequest(cvBase, partnerCode, region, action, body) {
  const response = await fetch(
    `${cvBase}/internal/partners/${encodeURIComponent(partnerCode)}/${action}`,
    { method: 'POST', headers: partnerHeaders(partnerCode, region), body: JSON.stringify(body) },
  );
  const data = await response.json().catch(() => null);
  if (!response.ok || data?.code !== 200) {
    throw new Error(data?.en_message || data?.zh_message || `CV partner request failed (HTTP ${response.status})`);
  }
  return data.data || {};
}

async function validateCachedIdentity(cvBase, partnerCode, region, identity) {
  const data = await partnerRequest(cvBase, partnerCode, region, 'users/validate', {
    uid: identity.uid,
    token: identity.token,
    navos_region: region,
  });
  return data.valid === true;
}

async function assertNavosBalance(profile, uid) {
  if ((process.env.NAVOS_PRECHECK_DISABLED || '').trim().toLowerCase() === 'true') return;
  const baseUrl = (process.env.NAVOS_BASE_URL || '').trim()
    || (profile === 'navos-cn' ? NAVOS_CN_BASE_URL : NAVOS_GLOBAL_BASE_URL);
  const response = await fetch(`${baseUrl.replace(/\/+$/, '')}${NAVOS_BALANCE_PATH}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Cm-Admin-Auth': (process.env.NAVOS_BALANCE_TOKEN || '').trim() || DEFAULT_BALANCE_TOKEN,
    },
    body: JSON.stringify({ common: { uid } }),
  });
  const payload = await response.json().catch(() => null);
  const available = Number(payload?.data?.available_balance);
  if (payload?.resp_common?.ret === 0 && Number.isFinite(available) && available <= 0) {
    const error = new Error('Navos balance insufficient. Please top up before using App Ranking insight.');
    error.code = 'NAVOS_INSUFFICIENT_BALANCE';
    throw error;
  }
}

export async function resolveCredentials({ cvBase, profile = loadRuntimeProfile() }) {
  const apiKey = (process.env.CV_API_KEY || '').trim();
  if (!isNavosProfile(profile)) {
    if (!apiKey) throw new Error('CV_API_KEY is required.');
    return { apiKey, profile, partnerCode: '', userIdentity: (process.env.CV_USER_IDENTITY || '').trim() };
  }

  if (apiKey && (process.env.CV_ALLOW_ENV_API_KEY || '').trim().toLowerCase() === 'true') {
    return { apiKey, profile, partnerCode: profile, userIdentity: (process.env.CV_USER_IDENTITY || '').trim(), uid: null };
  }

  const identity = loadNavosIdentity();
  const partnerCode = profile;
  const key = cacheKey(partnerCode, cvBase, identity.uid);
  const cache = readCache();
  const cached = cache[key];
  if (cached?.api_key) {
    const valid = await validateCachedIdentity(cvBase, partnerCode, profile === 'navos-cn' ? 'cn' : 'global', identity);
    if (valid) {
      await assertNavosBalance(profile, identity.uid);
      return { apiKey: cached.api_key, profile, partnerCode, userIdentity: cached.cv_user_identity || identity.email, uid: identity.uid };
    }
    delete cache[key];
    writeCache(cache);
    throw new Error('Navos session validation failed. Please re-login to Navos and retry.');
  }

  const region = profile === 'navos-cn' ? 'cn' : 'global';
  const userIdentity = region === 'cn' && !identity.email.startsWith('cn_') ? `cn_${identity.email}` : identity.email;
  const ensured = await partnerRequest(cvBase, partnerCode, region, 'api-keys/ensure', {
    uid: identity.uid,
    token: identity.token,
    email: userIdentity,
    navos_email: identity.email,
    client_version: SKILL_CHANNEL,
    navos_region: region,
  });
  if (!ensured.api_key) throw new Error('CV ensure returned no api_key.');
  cache[key] = {
    api_key: ensured.api_key,
    user_id: ensured.user_id || null,
    cv_user_identity: userIdentity,
    navos_token_hash: createHash('sha256').update(identity.token).digest('hex'),
    issued_at: new Date().toISOString(),
  };
  writeCache(cache);
  await assertNavosBalance(profile, identity.uid);
  return { apiKey: ensured.api_key, profile, partnerCode, userIdentity, uid: identity.uid };
}
