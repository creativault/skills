// CreatiVault OpenAPI 统一配置模块。
// Skill 只调用 CreatiVault OpenAPI，避免客户端依赖下游服务实现。

/**
 * CV OpenAPI 域名。可通过环境变量覆盖以支持测试环境。
 */
export const API_BASE_URL =
  (process.env.CV_OPENAPI_BASE_URL || '').trim() ||
  'https://creativault-business.creativault.ai';

/** CreatiVault App Ranking OpenAPI 路由前缀 */
export const API_PREFIX = '/openapi/v1/app-ranking';

/** 请求超时时间（毫秒） */
export const REQUEST_TIMEOUT_MS = 30_000;
