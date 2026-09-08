#!/usr/bin/env node
// Import a Client Brief, Script Brief, or Video URL into a Session.

import { callAPI, parseArgs, validateRequired } from './_api_client.mjs';

const params = parseArgs();
validateRequired(params, ['session_id', 'material_type', 'source_url']);

if (!['brief', 'video'].includes(params.material_type)) {
  console.error(JSON.stringify({ error: 'material_type must be brief or video' }));
  process.exit(1);
}

const body = {
  session_id: params.session_id,
  material_type: params.material_type,
  source_url: String(params.source_url).trim(),
};
if (params.material_type === 'brief') {
  const docType = params.doc_type || params.parameters?.doc_type;
  if (!['client', 'script'].includes(docType)) {
    console.error(JSON.stringify({ error: 'brief imports require doc_type=client or script' }));
    process.exit(1);
  }
  body.parameters = { doc_type: docType };
} else if (params.doc_type || params.parameters?.doc_type) {
  console.error(JSON.stringify({ error: 'video imports do not accept doc_type' }));
  process.exit(1);
}

const result = await callAPI('/openapi/v1/content-strategy/video-script-session-audit/sessions/materials/import', body);
console.log(JSON.stringify(result, null, 2));
