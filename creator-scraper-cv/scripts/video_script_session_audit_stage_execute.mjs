#!/usr/bin/env node
// Submit one Session audit stage.

import { callAPI, parseArgs, validateRequired } from './_api_client.mjs';

const params = parseArgs();
validateRequired(params, ['session_id', 'action']);
const actions = ['parse_brief', 'script_qc', 'analyze_video', 'run_audit', 'run_enhancement'];
if (!actions.includes(params.action)) {
  console.error(JSON.stringify({ error: `action must be one of: ${actions.join(' / ')}` }));
  process.exit(1);
}

const parameters = params.parameters || {};
if (params.action === 'run_enhancement' && (!parameters.code || typeof parameters.code !== 'string')) {
  console.error(JSON.stringify({ error: 'run_enhancement requires parameters.code' }));
  process.exit(1);
}

const result = await callAPI('/openapi/v1/content-strategy/video-script-session-audit/sessions/stages/execute', {
  session_id: params.session_id,
  action: params.action,
  parameters,
});
console.log(JSON.stringify(result, null, 2));
