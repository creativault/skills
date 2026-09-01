#!/usr/bin/env node
// 按ID查询App信息（精确匹配，先查 Google Play 再查 Apple Store）
//
// 用法:
//   node script/query_app_by_id.mjs '{"app_id":"com.zhiliaoapp.musically"}'
//
// 参数:
//   app_id (必填) — 目标 app_id（GP 为包名，Apple 为数字 ID）

import { parseArgs, validateRequired, postAPI } from './_api_client.mjs';

const params = parseArgs();
validateRequired(params, ['app_id']);

const result = await postAPI('/app/info/by-id', { app_id: params.app_id });
console.log(JSON.stringify(result, null, 2));
