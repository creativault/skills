#!/usr/bin/env node
// Create a video script Session audit.

import { callAPI, parseArgs } from './_api_client.mjs';

const params = parseArgs();
if (!params.audit_category || typeof params.audit_category !== 'string') {
  console.error(JSON.stringify({ error: 'audit_category is required' }));
  process.exit(1);
}

const body = { audit_category: params.audit_category.trim() };
if (params.name !== undefined) body.name = params.name;
const result = await callAPI('/openapi/v1/content-strategy/video-script-session-audit/sessions/create', body);
console.log(JSON.stringify(result, null, 2));
