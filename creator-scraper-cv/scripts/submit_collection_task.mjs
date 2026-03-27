#!/usr/bin/env node
// 提交采集任务（链接采集 / 用户名采集）
//
// 用法:
//   node submit_collection_task.mjs '{"task_type":"LINK_BATCH","platform":"tiktok","values":["https://www.tiktok.com/@creator1"]}'
//   node submit_collection_task.mjs '{"task_type":"FILE_UPLOAD","platform":"youtube","values":["creator1","creator2"]}'

import { callAPI, parseArgs, validateRequired, validatePlatform } from './_api_client.mjs';

const params = parseArgs();

validateRequired(params, ['task_type', 'platform', 'values']);
validatePlatform(params.platform);

const validTypes = ['LINK_BATCH', 'FILE_UPLOAD'];
if (!validTypes.includes(params.task_type)) {
  console.error(JSON.stringify({
    error: `task_type 必须为: ${validTypes.join(' / ')}`,
    received: params.task_type,
  }));
  process.exit(1);
}

if (!Array.isArray(params.values) || params.values.length === 0) {
  console.error(JSON.stringify({ error: 'values 必须为非空数组' }));
  process.exit(1);
}

if (params.values.length > 500) {
  console.error(JSON.stringify({ error: 'values 最多 500 个' }));
  process.exit(1);
}

const result = await callAPI('/openapi/v1/collection/tasks/submit', params);
console.log(JSON.stringify(result, null, 2));
