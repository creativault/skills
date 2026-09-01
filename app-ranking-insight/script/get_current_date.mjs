#!/usr/bin/env node
// 获取当前日期时间
//
// 用法:
//   node script/get_current_date.mjs

import { getAPI } from './_api_client.mjs';

const result = await getAPI('/current-date');
console.log(JSON.stringify(result, null, 2));
