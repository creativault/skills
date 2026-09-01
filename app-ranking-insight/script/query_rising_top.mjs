#!/usr/bin/env node
// 查询排名上升最快的App（只返回 incr > 0 的数据，按涨幅降序）
//
// 用法:
//   node script/query_rising_top.mjs '{"target_date":"20260820","top_n":10,"category_rank_type":"游戏榜"}'
//
// 参数:
//   target_date        (必填) — 目标日期，格式 YYYYmmdd
//   top_n              (可选) — 返回数量，默认 20（1~100）
//   genre_id           (可选) — 类目 ID，不传则不限类目
//   category_rank_type (可选) — 大类类型：应用榜/游戏榜/家庭榜/总榜，默认 "总榜"
//   sort_by            (可选) — 排序字段：genre_ranking_incr / category_ranking_incr，默认 genre_ranking_incr

import { parseArgs, validateRequired, postAPI } from './_api_client.mjs';

const params = parseArgs();
validateRequired(params, ['target_date']);

const body = {
  target_date: params.target_date,
  top_n: params.top_n || 20,
};
if (params.genre_id) body.genre_id = params.genre_id;
if (params.category_rank_type) body.category_rank_type = params.category_rank_type;
if (params.sort_by) body.sort_by = params.sort_by;

const result = await postAPI('/rank/rising-top', body);
console.log(JSON.stringify(result, null, 2));
