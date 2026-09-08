#!/usr/bin/env node
// Fetch the aggregate Session audit result.

import { callAPI, parseArgs, validateRequired } from './_api_client.mjs';

const params = parseArgs();
validateRequired(params, ['session_id']);
const result = await callAPI('/openapi/v1/content-strategy/video-script-session-audit/sessions/result', {
  session_id: params.session_id,
});
console.log(JSON.stringify(result, null, 2));
