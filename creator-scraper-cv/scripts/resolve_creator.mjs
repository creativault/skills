#!/usr/bin/env node
// Resolve creator username to platform ID
//
// Usage:
//   node {baseDir}/scripts/resolve_creator.mjs '{"platform":"tiktok","username":"creator_demo"}'

import { callAPI, parseArgs, validateRequired, validatePlatform } from './_api_client.mjs';

const params = parseArgs();
validateRequired(params, ['platform', 'username']);
validatePlatform(params.platform);

const result = await callAPI('/openapi/v1/creators/resolve', params);
console.log(JSON.stringify(result, null, 2));
