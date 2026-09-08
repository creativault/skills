#!/usr/bin/env node
// Query one or all Session audit stage statuses.

import { callAPI, parseArgs, validateRequired } from './_api_client.mjs';

const params = parseArgs();
validateRequired(params, ['session_id']);
const stages = [
  'brief_upload', 'brief_upload_script', 'brief_parse', 'script_qc',
  'video_upload', 'video_analysis', 'content_audit', 'enhancement',
];
if (params.stage !== undefined && !stages.includes(params.stage)) {
  console.error(JSON.stringify({ error: `stage must be one of: ${stages.join(' / ')}` }));
  process.exit(1);
}

const body = { session_id: params.session_id };
if (params.stage !== undefined) body.stage = params.stage;
const result = await callAPI('/openapi/v1/content-strategy/video-script-session-audit/sessions/stages/status', body);
console.log(JSON.stringify(result, null, 2));
