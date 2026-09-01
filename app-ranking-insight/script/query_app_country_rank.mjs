#!/usr/bin/env node
// 查询App跨国家排名（发现投放线索和跨区域表现差异）
//
// 用法:
//   node script/query_app_country_rank.mjs '{"app_name":"Clash of Clans","target_date":"20260815","category_rank_type":"游戏榜"}'
//
// 参数:
//   app_name           (必填) — 目标 app 名称（支持模糊匹配）
//   target_date        (必填) — 目标日期，格式 YYYYmmdd
//   category_rank_type (可选) — 大类类型：应用榜/游戏榜/家庭榜/总榜，默认 "总榜"

import { parseArgs, validateRequired, postAPI } from './_api_client.mjs';

const params = parseArgs();
validateRequired(params, ['app_name', 'target_date']);

const body = {
  app_name: params.app_name,
  target_date: params.target_date,
};
if (params.category_rank_type) body.category_rank_type = params.category_rank_type;

const result = await postAPI('/app/country-rank', body);
console.log(JSON.stringify(result, null, 2));
