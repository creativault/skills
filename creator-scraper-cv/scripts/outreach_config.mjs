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

import { callAPI, parseArgs } from './_api_client.mjs';

const params = parseArgs();
const result = await callAPI('/openapi/v1/outreach/config', params, null, { skipUserIdentity: false });
console.log(JSON.stringify(result, null, 2));
