#!/usr/bin/env node
// 列出榜单类目列表
//
// 用法:
//   node script/list_rank_genres.mjs
//   node script/list_rank_genres.mjs '{"category_type":"游戏"}'
//
// 参数:
//   category_type (可选) — 过滤类型：应用/游戏/全部，不传返回全部

import { parseArgs, postAPI } from './_api_client.mjs';

const params = parseArgs();

const body = {};
if (params.category_type) {
  body.category_type = params.category_type;
}

const result = await postAPI('/rank/genres', body);
console.log(JSON.stringify(result, null, 2));
