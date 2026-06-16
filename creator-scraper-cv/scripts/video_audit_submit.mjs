#!/usr/bin/env node
// 提交视频脚本审核任务（异步），支持两条摄入链路
//
// 用法:
//   # 链路1: 社媒 URL（TikTok/Instagram Reels/YouTube Shorts，后端自动下载）
//   node scripts/video_audit_submit.mjs '{"url":"https://www.tiktok.com/@creator/video/123456"}'
//
//   # 链路2: 上传素材（先调 media_upload.mjs 拿 oss_key，再传 uploaded_oss_key）
//   node scripts/video_audit_submit.mjs '{"uploaded_oss_key":"media_ingestion/uploads/user@example.com/20260615_103000_a1b2c3d4.mp4","brief":"发布前自审"}'
//
//   # 完整参数示例
//   node scripts/video_audit_submit.mjs '{"url":"...","brief":"产品卖点...","audit_mode":"high","enable_benchmark":true}'
//
// 参数:
//   url               — 链路1必填（与 uploaded_oss_key 二选一），社媒视频 URL
//   uploaded_oss_key  — 链路2必填（与 url 二选一），由 media_upload.mjs 返回的 oss_key
//   brief             — 可选，客户 Brief（用于符合度审核）
//   user_id           — 可选，用户标识（默认用 X-User-Identity）
//   campaign_id       — 可选，活动 ID
//   audit_mode        — 可选，审核模式: high(默认) / low
//   is_benchmark      — 可选，是否标记为优质案例（进入 benchmark 库），默认 false
//   enable_benchmark  — 可选，是否启用 benchmark 对比，默认 false
//   oss_url_override  — 可选，手动提供 OSS URL 跳过下载（旧 workaround，新接入推荐用 uploaded_oss_key）
//
// 链路差异:
//   链路1 (url):              支持反查达人数据（粉丝/历史均播/爆款分级）
//   链路2 (uploaded_oss_key): creator_metadata/video_metrics 返回 status=not_applicable
//                              （上传素材天然无社媒身份，非数据缺失）
//
// 返回:
//   task_id              — 任务唯一标识（UUID）
//   status               — "processing"
//   estimated_time_seconds — 预估耗时（约 240 秒）
//
// 计费: 固定 100 credits/次（与链路无关，与视频长度无关）

import { callAPI, parseArgs } from './_api_client.mjs';

const params = parseArgs();

// 链路二选一校验：url / uploaded_oss_key 至少传一个
const hasUrl = Boolean(params.url);
const hasUploadedKey = Boolean(params.uploaded_oss_key);
const hasOverride = Boolean(params.oss_url_override);

if (!hasUrl && !hasUploadedKey && !hasOverride) {
  console.error(JSON.stringify({
    error: '链路必填参数缺失',
    hint: '链路1传 url（社媒 URL），或链路2传 uploaded_oss_key（先调 media_upload.mjs 拿到）',
    examples: {
      链路1: '{"url":"https://www.tiktok.com/@creator/video/123"}',
      链路2: '{"uploaded_oss_key":"media_ingestion/uploads/.../xxx.mp4"}',
    },
  }));
  process.exit(1);
}

if (hasUrl && hasUploadedKey) {
  console.error(JSON.stringify({
    error: 'url 和 uploaded_oss_key 不能同时传',
    hint: '两条链路只能选其一：链路1 用 url，链路2 用 uploaded_oss_key',
  }));
  process.exit(1);
}

// 链路1: URL 格式校验（宽松：只要求 http/https 开头）
if (hasUrl && !/^https?:\/\/.+/i.test(params.url)) {
  console.error(JSON.stringify({
    error: 'url must be a valid HTTP/HTTPS URL',
    received: params.url,
    hint: 'Supported: TikTok video, Instagram Reels, YouTube Shorts URLs',
  }));
  process.exit(1);
}

// 链路2: oss_key 格式校验（宽松：非空字符串）
if (hasUploadedKey && (typeof params.uploaded_oss_key !== 'string' || !params.uploaded_oss_key.trim())) {
  console.error(JSON.stringify({
    error: 'uploaded_oss_key must be a non-empty string',
    hint: '应为 media_upload.mjs 返回的 oss_key，例如 "media_ingestion/uploads/user@example.com/20260615_103000_a1b2c3d4.mp4"',
  }));
  process.exit(1);
}

// 校验 audit_mode（后端只支持 high / low，不再支持 medium）
if (params.audit_mode && !['high', 'low'].includes(params.audit_mode)) {
  console.error(JSON.stringify({
    error: 'audit_mode must be one of: high / low',
    received: params.audit_mode,
  }));
  process.exit(1);
}

const body = {
  ...(params.url && { url: params.url }),
  ...(params.uploaded_oss_key && { uploaded_oss_key: params.uploaded_oss_key }),
  ...(params.brief && { brief: params.brief }),
  ...(params.user_id && { user_id: params.user_id }),
  ...(params.campaign_id && { campaign_id: params.campaign_id }),
  ...(params.audit_mode && { audit_mode: params.audit_mode }),
  ...(params.is_benchmark !== undefined && { is_benchmark: Boolean(params.is_benchmark) }),
  ...(params.enable_benchmark !== undefined && { enable_benchmark: Boolean(params.enable_benchmark) }),
  ...(params.oss_url_override && { oss_url_override: params.oss_url_override }),
};

const result = await callAPI('/openapi/v1/video-script-audit/tasks/submit', body);
console.log(JSON.stringify(result, null, 2));
