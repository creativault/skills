#!/usr/bin/env node
// 查询App广告投放洞察（含投放规模、地区分布、平台分布、环比变化）
//
// 用法:
//   node script/query_app_ad_insight.mjs '{"app_id":"com.supercell.clashofclans","stat_month":"202607"}'
//
// 参数:
//   app_id     (必填) — 目标 app 的 ID
//   stat_month (必填) — 统计月份，格式 YYYYmm

import { parseArgs, validateRequired, postAPI } from './_api_client.mjs';

const params = parseArgs();
validateRequired(params, ['app_id', 'stat_month']);

const result = await postAPI('/app/ad-insight', {
  app_id: params.app_id,
  stat_month: params.stat_month,
});
console.log(JSON.stringify(result, null, 2));
