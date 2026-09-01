#!/usr/bin/env node
// 列出支持的榜单类型
//
// 用法:
//   node script/list_rank_types.mjs

import { getAPI } from './_api_client.mjs';

const result = await getAPI('/ranks');
console.log(JSON.stringify(result, null, 2));
