// Creativault Open API 公共调用模块
// 所有脚本共享的认证、请求、错误处理逻辑

const API_BASE = (process.env.CV_API_BASE_URL || 'https://dev01-creativault-business.tec-develop.cn').replace(/\/+$/, '');
const API_KEY = process.env.CV_API_KEY;
const USER_IDENTITY = process.env.CV_USER_IDENTITY;

if (!API_KEY) {
  console.error(JSON.stringify({
    error: '未设置 CV_API_KEY 环境变量',
    hint: '请设置: export CV_API_KEY=cv_live_your_key_here',
  }));
  process.exit(1);
}

if (!USER_IDENTITY) {
  console.error(JSON.stringify({
    error: '未设置 CV_USER_IDENTITY 环境变量',
    hint: '请设置: export CV_USER_IDENTITY=your_email@example.com',
  }));
  process.exit(1);
}

/**
 * 调用 Creativault Open API
 * @param {string} path - API 路径，如 /openapi/v1/creators/tiktok/search
 * @param {object} body - 请求体
 * @returns {object} 完整响应（含 success, data, error, meta）
 */
export async function callAPI(path, body = {}) {
  const url = `${API_BASE}${path}`;

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
        'X-User-Identity': USER_IDENTITY,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error(JSON.stringify({
      error: `网络请求失败: ${err.message}`,
      url,
    }));
    process.exit(1);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    console.error(JSON.stringify({
      error: `响应解析失败，HTTP 状态码: ${response.status}`,
      url,
    }));
    process.exit(1);
  }

  if (!data.success) {
    console.error(JSON.stringify({
      error: data.error?.message || '请求失败',
      code: data.error?.code,
      request_id: data.meta?.request_id,
    }, null, 2));
    process.exit(1);
  }

  return data;
}

/**
 * 解析命令行 JSON 参数
 * @returns {object} 解析后的参数对象
 */
export function parseArgs() {
  const raw = process.argv[2];
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    console.error(JSON.stringify({
      error: '参数必须是有效的 JSON 字符串',
      received: raw,
    }));
    process.exit(1);
  }
}

/**
 * 校验必填参数
 * @param {object} params - 参数对象
 * @param {string[]} required - 必填字段名列表
 */
export function validateRequired(params, required) {
  const missing = required.filter(key => params[key] === undefined || params[key] === null);
  if (missing.length > 0) {
    console.error(JSON.stringify({
      error: `缺少必填参数: ${missing.join(', ')}`,
    }));
    process.exit(1);
  }
}

const VALID_PLATFORMS = ['tiktok', 'youtube', 'instagram'];

/**
 * 校验平台参数
 * @param {string} platform
 */
export function validatePlatform(platform) {
  if (!platform || !VALID_PLATFORMS.includes(platform)) {
    console.error(JSON.stringify({
      error: `platform 必须为: ${VALID_PLATFORMS.join(' / ')}`,
      received: platform,
    }));
    process.exit(1);
  }
}
