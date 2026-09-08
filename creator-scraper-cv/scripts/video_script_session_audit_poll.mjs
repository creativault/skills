#!/usr/bin/env node
// Poll one Session stage until completed, failed, or timeout.

import { callAPI, parseArgs, validateRequired } from './_api_client.mjs';

const params = parseArgs();
validateRequired(params, ['session_id', 'stage']);
const interval = Number(params.interval || 10);
const maxAttempts = Number(params.max_attempts || 60);
if (!Number.isFinite(interval) || interval <= 0 || !Number.isFinite(maxAttempts) || maxAttempts <= 0) {
  console.error(JSON.stringify({ error: 'interval and max_attempts must be positive numbers' }));
  process.exit(1);
}

const terminalStates = new Set(['completed', 'failed']);
const sleep = seconds => new Promise(resolve => setTimeout(resolve, seconds * 1000));

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  const result = await callAPI('/openapi/v1/content-strategy/video-script-session-audit/sessions/stages/status', {
    session_id: params.session_id,
    stage: params.stage,
  });
  const status = result?.data?.status;
  console.error(`[poll ${attempt}/${maxAttempts}] stage=${params.stage} status=${status}`);
  if (terminalStates.has(status)) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(status === 'completed' ? 0 : 1);
  }
  if (attempt < maxAttempts) await sleep(interval);
}

const timeout = {
  success: false,
  error: { message: `Polling timed out after ${maxAttempts * interval} seconds` },
  data: { session_id: params.session_id, stage: params.stage },
};
console.log(JSON.stringify(timeout, null, 2));
process.exit(1);
