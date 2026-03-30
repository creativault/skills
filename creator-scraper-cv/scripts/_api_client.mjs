// Creativault Open API client module
// Shared authentication, request, and error handling logic

const API_BASE = (process.env.CV_API_BASE_URL || 'https://dev01-creativault-business.tec-develop.cn').replace(/\/+$/, '');
const API_KEY = process.env.CV_API_KEY;
const USER_IDENTITY = process.env.CV_USER_IDENTITY;

if (!API_KEY) {
  console.error(JSON.stringify({
    error: 'CV_API_KEY environment variable is not set',
    hint: 'Set it via: export CV_API_KEY=cv_live_your_key_here',
  }));
  process.exit(1);
}

if (!USER_IDENTITY) {
  console.error(JSON.stringify({
    error: 'CV_USER_IDENTITY environment variable is not set',
    hint: 'Set it via: export CV_USER_IDENTITY=your_email@example.com',
  }));
  process.exit(1);
}

/**
 * Call Creativault Open API
 * @param {string} path - API path, e.g. /openapi/v1/creators/tiktok/search
 * @param {object} body - Request body
 * @returns {object} Full response (success, data, error, meta)
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
      error: `Network request failed: ${err.message}`,
      url,
    }));
    process.exit(1);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    console.error(JSON.stringify({
      error: `Failed to parse response, HTTP status: ${response.status}`,
      url,
    }));
    process.exit(1);
  }

  if (!data.success) {
    console.error(JSON.stringify({
      error: data.error?.message || 'Request failed',
      code: data.error?.code,
      request_id: data.meta?.request_id,
    }, null, 2));
    process.exit(1);
  }

  return data;
}

/**
 * Parse command-line JSON argument
 * @returns {object} Parsed parameters
 */
export function parseArgs() {
  const raw = process.argv[2];
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    console.error(JSON.stringify({
      error: 'Argument must be a valid JSON string',
      received: raw,
    }));
    process.exit(1);
  }
}

/**
 * Validate required parameters
 * @param {object} params - Parameter object
 * @param {string[]} required - List of required field names
 */
export function validateRequired(params, required) {
  const missing = required.filter(key => params[key] === undefined || params[key] === null);
  if (missing.length > 0) {
    console.error(JSON.stringify({
      error: `Missing required parameters: ${missing.join(', ')}`,
    }));
    process.exit(1);
  }
}

const VALID_PLATFORMS = ['tiktok', 'youtube', 'instagram'];

/**
 * Validate platform parameter
 * @param {string} platform
 */
export function validatePlatform(platform) {
  if (!platform || !VALID_PLATFORMS.includes(platform)) {
    console.error(JSON.stringify({
      error: `platform must be one of: ${VALID_PLATFORMS.join(' / ')}`,
      received: platform,
    }));
    process.exit(1);
  }
}
