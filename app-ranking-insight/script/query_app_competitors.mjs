#!/usr/bin/env node
// 查询App竞品信息
//
// 用法:
//   node script/query_app_competitors.mjs '{"app_id":"com.supercell.clashofclans","country_code":"us","platform":"2"}'
//
// 参数:
//   app_id       (必填) — 目标 app 的 app_id
//   country_code (可选) — 国家代码缩写（如 us, jp, all），默认 "all"
//   platform     (可选) — 平台：0=全部，1=iOS，2=Android，默认 "0"

import { parseArgs, validateRequired, postAPI } from './_api_client.mjs';

const params = parseArgs();
validateRequired(params, ['app_id']);

const body = {
  app_id: params.app_id,
};
if (params.country_code) body.country_code = params.country_code;
if (params.platform) body.platform = params.platform;

const result = await postAPI('/app/competitors', body);
console.log(JSON.stringify(result, null, 2));
