#!/usr/bin/env node
// 查询App排名趋势（纵向观察一段时间内的排名走势）
//
// 用法:
//   node script/query_app_rank_trend.mjs '{"app_name":"Roblox","start_date":"20260801","end_date":"20260820","category_rank_type":"游戏榜"}'
//
// 参数:
//   app_name           (必填) — 目标 app 名称（支持模糊匹配）
//   start_date         (必填) — 起始日期，格式 YYYYmmdd
//   end_date           (必填) — 结束日期，格式 YYYYmmdd
//   category_rank_type (可选) — 大类类型：应用榜/游戏榜/家庭榜/总榜，默认 "总榜"

import { parseArgs, validateRequired, postAPI } from './_api_client.mjs';

const params = parseArgs();
validateRequired(params, ['app_name', 'start_date', 'end_date']);

const body = {
  app_name: params.app_name,
  start_date: params.start_date,
  end_date: params.end_date,
};
if (params.category_rank_type) body.category_rank_type = params.category_rank_type;

const result = await postAPI('/app/rank-trend', body);
console.log(JSON.stringify(result, null, 2));
