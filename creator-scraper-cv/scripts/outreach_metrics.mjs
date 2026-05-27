/**
 * outreach_metrics.mjs — 建联效果指标
 *
 * 用法: node scripts/outreach_metrics.mjs '{"date_from":"2025-05-01","group_by":"week"}'
 *
 * 参数:
 *   date_from  — 开始日期 YYYY-MM-DD（默认最近7天）
 *   date_to    — 结束日期 YYYY-MM-DD
 *   group_by   — 分组: day / week / month（不传则返回汇总）
 */

import { callAPI, parseArgs } from './_api_client.mjs';

const params = parseArgs();
const result = await callAPI('/openapi/v1/outreach/metrics', params, null, { skipUserIdentity: false });
console.log(JSON.stringify(result, null, 2));
