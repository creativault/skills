// Creativault Open API client module
// Shared authentication, request, error handling, and retry logic

const API_BASE = (process.env.CV_API_BASE_URL || 'http://api.creativault.vip').replace(/\/+$/, '');
const API_KEY = process.env.CV_API_KEY;
const USER_IDENTITY = process.env.CV_USER_IDENTITY;

const MAX_RETRIES = 3;
const DEFAULT_RETRY_AFTER = 60;

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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Call Creativault Open API with auto-retry on 429
 * @param {string} path - API path, e.g. /openapi/v1/creators/tiktok/search
 * @param {object} body - Request body
 * @param {string} platform - Platform name for preprocessing (optional)
 * @returns {Promise<object>} Full response (success, data, error, meta)
 */
export async function callAPI(path, body = {}, platform = null) {
  // Preprocess industry parameters if platform is provided
  let processedBody = body;
  if (platform) {
    processedBody = await preprocessIndustryParams(platform, body);
  }
  
  const url = `${API_BASE}${path}`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
          'X-User-Identity': USER_IDENTITY,
        },
        body: JSON.stringify(processedBody),
      });
    } catch (err) {
      console.error(JSON.stringify({ error: `Network request failed: ${err.message}`, url }));
      process.exit(1);
    }

    // Auto-retry on 429 rate limit
    if (response.status === 429 && attempt < MAX_RETRIES) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || DEFAULT_RETRY_AFTER, 10);
      console.error(`[retry] Rate limited (429). Waiting ${retryAfter}s before retry ${attempt + 1}/${MAX_RETRIES}...`);
      await sleep(retryAfter * 1000);
      continue;
    }

    let data;
    try {
      data = await response.json();
    } catch {
      console.error(JSON.stringify({ error: `Failed to parse response, HTTP status: ${response.status}`, url }));
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

  // All retries exhausted
  console.error(JSON.stringify({ error: `Rate limit: max retries (${MAX_RETRIES}) exhausted`, url }));
  process.exit(1);
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
    console.error(JSON.stringify({ error: 'Argument must be a valid JSON string', received: raw }));
    process.exit(1);
  }
}

/**
 * Validate required parameters
 * @param {object} params
 * @param {string[]} required
 */
export function validateRequired(params, required) {
  const missing = required.filter(key => params[key] === undefined || params[key] === null);
  if (missing.length > 0) {
    console.error(JSON.stringify({ error: `Missing required parameters: ${missing.join(', ')}` }));
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
    console.error(JSON.stringify({ error: `platform must be one of: ${VALID_PLATFORMS.join(' / ')}`, received: platform }));
    process.exit(1);
  }
}

/**
 * Preprocess industry category parameters based on platform
 * @param {string} platform - Platform name (tiktok/youtube/instagram)
 * @param {object} params - Request parameters
 * @returns {Promise<object>} Processed parameters
 */
export async function preprocessIndustryParams(platform, params) {
  // Import industry mapper functions dynamically
  const { convertToLeafIds } = await import('./_industry_mapper.mjs');
  
  const processed = { ...params };
  
  if (platform === 'tiktok') {
    // TikTok: industry_category_levels_list expects level-3 IDs (comma-separated string)
    if (processed.industry_category_levels_list) {
      const input = processed.industry_category_levels_list;
      
      // If it's already a comma-separated list of IDs, validate and keep
      if (typeof input === 'string' && /^\d{8}(,\d{8})*$/.test(input)) {
        // Already in correct format
        return processed;
      }
      
      // Convert single input to array of level-3 IDs
      const leafIds = convertToLeafIds(input);
      if (leafIds.length > 0) {
        processed.industry_category_levels_list = leafIds.join(',');
      }
    }
  } else if (platform === 'youtube' || platform === 'instagram') {
    // YouTube/Instagram: industry expects level-3 IDs (comma-separated string), same as TikTok
    if (processed.industry) {
      const input = processed.industry;
      
      // If it's already a comma-separated list of IDs, validate and keep
      if (typeof input === 'string' && /^\d{8}(,\d{8})*$/.test(input)) {
        // Already in correct format
        return processed;
      }
      
      // Convert input to array of level-3 IDs
      const leafIds = convertToLeafIds(input);
      if (leafIds.length > 0) {
        processed.industry = leafIds.join(',');
      }
    }
  }
  
  return processed;
}
