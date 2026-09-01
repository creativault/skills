// CV OpenAPI 通用请求客户端。
// Skill 通过用户 API Key 请求 CreatiVault OpenAPI。

import { API_BASE_URL, API_PREFIX, REQUEST_TIMEOUT_MS } from './_config.mjs';
import { loadRuntimeProfile, resolveCredentials } from './_navos_auth.mjs';

const RUNTIME_PROFILE = loadRuntimeProfile();

const PATH_MAP = {
  '/current-date': '/current-date',
  '/ranks': '/rank-types',
  '/rank/genres': '/rank-genres',
  '/rank/top-n': '/rank-top',
  '/rank/rising-top': '/rising-top',
  '/app/info/by-name': '/app-info/by-name',
  '/app/info/by-id': '/app-info/by-id',
  '/app/rank-trend': '/rank-trend',
  '/app/country-rank': '/country-rank',
  '/app/country-download-revenue': '/country-download-revenue',
  '/app/competitors': '/competitors',
  '/app/ad-insight': '/ad-insight',
};

function resolveUrl(path) {
  const mappedPath = PATH_MAP[path];
  if (!mappedPath) {
    throw new Error(`Unsupported App Ranking path: ${path}`);
  }
  return `${API_BASE_URL}${API_PREFIX}${mappedPath}`;
}

async function buildHeaders() {
  const credentials = await resolveCredentials({ cvBase: API_BASE_URL, profile: RUNTIME_PROFILE });
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-API-Key': credentials.apiKey,
    'X-CV-Skill-Name': 'app-ranking-insight',
    'X-CV-Skill-Version': '1.0.0',
    'X-CV-Skill-Channel': 'stable',
    'X-CV-Skill-Profile': credentials.profile,
    ...(credentials.partnerCode ? { 'X-Source': credentials.partnerCode } : {}),
    ...(credentials.userIdentity ? { 'X-User-Identity': credentials.userIdentity } : {}),
    ...(credentials.profile === 'navos-cn' ? { 'X-Navos-Region': 'cn' } : {}),
    ...(credentials.profile === 'navos-global' ? { 'X-Navos-Region': 'global' } : {}),
  };
}

async function callCV(path, body) {
  const url = resolveUrl(path);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: await buildHeaders(),
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await res.json();
    if (!res.ok || data?.success === false) {
      return {
        error: data?.error?.message || data?.detail || `HTTP ${res.status}`,
        code: data?.error?.code,
        status: res.status,
        meta: data?.meta,
      };
    }
    return data?.data ?? data;
  } catch (e) {
    if (e.name === 'AbortError') {
      return { error: `请求超时 (${REQUEST_TIMEOUT_MS}ms)`, url };
    }
    return { error: e.message, url };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 解析命令行 JSON 参数
 * 用法: node script.mjs '{"key":"value"}'
 * @returns {object}
 */
export function parseArgs() {
  const raw = process.argv[2];
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error(JSON.stringify({ error: '参数解析失败，请传入合法 JSON', detail: e.message }));
    process.exit(1);
  }
}

/**
 * 校验必填字段
 * @param {object} params
 * @param {string[]} fields
 */
export function validateRequired(params, fields) {
  const missing = fields.filter(f => params[f] === undefined || params[f] === null || params[f] === '');
  if (missing.length > 0) {
    console.error(JSON.stringify({ error: `缺少必填参数: ${missing.join(', ')}` }));
    process.exit(1);
  }
}

/**
 * 发起只读请求。为保证 CV 认证协议一致，对外统一使用 POST。
 * @param {string} path - App Ranking 语义路径，如 '/current-date'
 * @returns {Promise<object>}
 */
export async function getAPI(path) {
  return callCV(path, {});
}

/**
 * 发起 POST 请求
 * @param {string} path - API 路径（不含前缀），如 '/app/info/by-name'
 * @param {object} body - 请求体
 * @returns {Promise<object>}
 */
export async function postAPI(path, body = {}) {
  return callCV(path, body);
}
