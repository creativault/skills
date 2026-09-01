#!/usr/bin/env node
// 查询App各国下载收入分布（近30天维度）
//
// 用法:
//   node script/query_app_country_download_revenue.mjs '{"app_id":"com.supercell.clashofclans"}'
//
// 参数:
//   app_id (必填) — 目标 app 的 app_id

import { parseArgs, validateRequired, postAPI } from './_api_client.mjs';

const params = parseArgs();
validateRequired(params, ['app_id']);

const result = await postAPI('/app/country-download-revenue', {
  app_id: params.app_id,
});
console.log(JSON.stringify(result, null, 2));
