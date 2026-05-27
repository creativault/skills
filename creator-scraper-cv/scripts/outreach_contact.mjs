/**
 * outreach_contact.mjs — 查询达人建联信息（状态+历史+AI总结）
 *
 * 用法: node scripts/outreach_contact.mjs '{"email":"creator@x.com"}'
 *
 * 参数:
 *   email (必填)       — 达人邮箱
 *   include_history    — 是否包含沟通历史（默认 true）
 *   include_summary    — 是否包含 AI 总结（默认 true）
 */

import { apiClient } from './_api_client.mjs';

const params = JSON.parse(process.argv[2] || '{}');

if (!params.email) {
  console.error('Error: "email" is required');
  process.exit(1);
}

const result = await apiClient.post('/v1/outreach/contact', params);
console.log(JSON.stringify(result, null, 2));
