#!/usr/bin/env node
// Search creators — supports TikTok / YouTube / Instagram
//
// Usage:
//   node search_creators.mjs '{"platform":"tiktok","keyword":"beauty","country_code":"US","followers_cnt_gte":10000}'

import { callAPI, parseArgs, validatePlatform } from './_api_client.mjs';

const params = parseArgs();
const { platform, ...searchParams } = params;

validatePlatform(platform);

const result = await callAPI(`/openapi/v1/creators/${platform}/search`, searchParams);
console.log(JSON.stringify(result, null, 2));
