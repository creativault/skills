/**
 * outreach_config.mjs — 查询配置（可用渠道+邮件模板）
 *
 * 用法: node scripts/outreach_config.mjs '{}'
 *
 * 参数:
 *   include_templates  — 是否包含模板列表（默认 true）
 *   template_page      — 模板分页-页码（默认 1）
 *   template_size      — 模板分页-每页数量（默认 20）
 */

import { apiClient } from './_api_client.mjs';

const params = JSON.parse(process.argv[2] || '{}');
const result = await apiClient.post('/v1/outreach/config', params);
console.log(JSON.stringify(result, null, 2));
