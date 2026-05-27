/**
 * outreach_upload.mjs — 上传邮件附件
 *
 * 用法: node scripts/outreach_upload.mjs '{"file_path":"./media_kit.pdf"}'
 *
 * 参数:
 *   file_path (必填)  — 本地文件路径（最大 10MB）
 */

import { parseArgs, validateRequired } from './_api_client.mjs';
import { readFileSync } from 'fs';
import { basename } from 'path';

const API_BASE = (process.env.CV_API_BASE_URL || 'http://api.creativault.vip').replace(/\/+$/, '');
const API_KEY = process.env.CV_API_KEY;
const USER_IDENTITY = process.env.CV_USER_IDENTITY;

if (!API_KEY) {
  console.error(JSON.stringify({ error: 'CV_API_KEY environment variable is not set' }));
  process.exit(1);
}
if (!USER_IDENTITY) {
  console.error(JSON.stringify({ error: 'CV_USER_IDENTITY environment variable is not set' }));
  process.exit(1);
}

const params = parseArgs();
validateRequired(params, ['file_path']);

const filePath = params.file_path;
const fileName = basename(filePath);
const fileContent = readFileSync(filePath);

// Build multipart/form-data manually using Blob API (Node 20.6+)
const formData = new FormData();
formData.append('file', new Blob([fileContent]), fileName);

const url = `${API_BASE}/openapi/v1/outreach/upload`;
const response = await fetch(url, {
  method: 'POST',
  headers: {
    'X-API-Key': API_KEY,
    'X-User-Identity': USER_IDENTITY,
  },
  body: formData,
});

const data = await response.json();
if (!data.success) {
  console.error(JSON.stringify({
    error: data.error?.message || 'Upload failed',
    code: data.error?.code,
    request_id: data.meta?.request_id,
  }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify(data, null, 2));
