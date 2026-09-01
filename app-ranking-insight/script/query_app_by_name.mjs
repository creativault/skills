#!/usr/bin/env node
// 按名称查询App信息（模糊匹配，各平台返回前5条）
//
// 用法:
//   node script/query_app_by_name.mjs '{"app_name":"TikTok"}'
//
// 参数:
//   app_name (必填) — 目标查询 app 名称

import { parseArgs, validateRequired, postAPI } from './_api_client.mjs';

const params = parseArgs();
validateRequired(params, ['app_name']);

const result = await postAPI('/app/info/by-name', { app_name: params.app_name });
console.log(JSON.stringify(result, null, 2));
