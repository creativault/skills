#!/usr/bin/env node
// Find lookalike/similar creators based on a seed creator
//
// Usage:
//   node {baseDir}/scripts/find_lookalike.mjs '{"seed_platform_id":"7123456789","seed_platform":"tiktok","target_platform":"tiktok","limit":10}'

import { callAPI, parseArgs, validateRequired, validatePlatform } from './_api_client.mjs';

const params = parseArgs();
validateRequired(params, ['seed_platform_id', 'seed_platform', 'target_platform']);
validatePlatform(params.seed_platform);
validatePlatform(params.target_platform);

const result = await callAPI('/openapi/v1/creators/lookalike', params);
console.log(JSON.stringify(result, null, 2));
