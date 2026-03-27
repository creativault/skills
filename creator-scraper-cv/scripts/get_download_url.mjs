#!/usr/bin/env node
// 获取文件下载链接
//
// 用法:
//   node get_download_url.mjs '{"file_id":"a1b2c3d4e5f6"}'
//   node get_download_url.mjs '{"file_name":"upload-youtube - 20条.xls"}'

import { callAPI, parseArgs } from './_api_client.mjs';

const params = parseArgs();

if (!params.file_id && !params.file_name) {
  console.error(JSON.stringify({
    error: '必须指定 file_id 或 file_name（至少一个）',
  }));
  process.exit(1);
}

const result = await callAPI('/openapi/v1/files/download-url', params);
console.log(JSON.stringify(result, null, 2));
