#!/usr/bin/env node
// 查询榜单TopN数据（含新增 app 对比分析）
//
// 用法:
//   node script/query_rank_top_n.mjs '{"rank_type":"免费榜","app_type":"游戏榜","top_n":20,"target_date":"20260820"}'
//
// 参数:
//   rank_type   (必填) — 榜单类型：免费榜/预约榜/付费榜/畅销榜/人气蹿升
//   app_type    (必填) — 应用类型：应用榜/游戏榜/家庭榜
//   target_date (必填) — 目标日期，格式 YYYYmmdd
//   top_n       (可选) — 返回数量，默认 10（1~100）

import { parseArgs, validateRequired, postAPI } from './_api_client.mjs';

const params = parseArgs();
validateRequired(params, ['rank_type', 'app_type', 'target_date']);

const result = await postAPI('/rank/top-n', {
  rank_type: params.rank_type,
  app_type: params.app_type,
  target_date: params.target_date,
  top_n: params.top_n || 10,
});
console.log(JSON.stringify(result, null, 2));
