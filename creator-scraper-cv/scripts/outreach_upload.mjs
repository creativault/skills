/**
 * outreach_upload.mjs — 上传邮件附件
 *
 * 用法: node scripts/outreach_upload.mjs '{"file_path":"./media_kit.pdf"}'
 *
 * 参数:
 *   file_path (必填)  — 本地文件路径
 */

import { apiClient } from './_api_client.mjs';
import { readFileSync } from 'fs';
import { basename } from 'path';

const params = JSON.parse(process.argv[2] || '{}');

if (!params.file_path) {
  console.error('Error: "file_path" is required');
  process.exit(1);
}

const filePath = params.file_path;
const fileName = basename(filePath);
const fileContent = readFileSync(filePath);

const result = await apiClient.upload('/v1/outreach/upload', fileContent, fileName);
console.log(JSON.stringify(result, null, 2));
