#!/usr/bin/env node
// 轮询视频脚本审核任务状态，完成后自动获取结果
//
// 用法:
//   node scripts/video_audit_poll.mjs '{"task_id":"550e8400-e29b-41d4-a716-446655440000"}'
//   node scripts/video_audit_poll.mjs '{"task_id":"xxx","interval":10,"max_attempts":40}'
//
// 参数:
//   task_id       — 必填，任务 ID（UUID）
//   interval      — 可选，轮询间隔秒数，默认 10
//   max_attempts  — 可选，最大轮询次数，默认 40（即默认最多等 400 秒 ≈ 6.7 分钟）
//   fetch_result  — 可选，完成后是否自动获取结果，默认 true
//
// 行为:
//   1. 每 interval 秒查询一次 /tasks/status
//   2. 到达终态（completed/failed）后停止
//   3. 若 fetch_result=true 且 status=completed，自动调用 /tasks/result 并输出完整审核结果
//   4. 若失败或超时，输出错误信息

import { callAPI, parseArgs, validateRequired } from './_api_client.mjs';

const params = parseArgs();
validateRequired(params, ['task_id']);

const taskId = params.task_id;
const interval = params.interval || 10;
const maxAttempts = params.max_attempts || 40;
const fetchResult = params.fetch_result !== false;

const TERMINAL_STATES = ['completed', 'failed'];

function sleep(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

console.error(`[视频审核轮询] 开始监控任务 ${taskId}，间隔 ${interval}s，最多 ${maxAttempts} 次`);

for (let attempt = 1; attempt <= maxAttempts; attempt++) {
  const statusResult = await callAPI('/openapi/v1/video-script-audit/tasks/status', {
    task_id: taskId,
  });

  const { status, progress, created_at, completed_at, error_message } = statusResult.data;

  console.error(`[轮询 ${attempt}/${maxAttempts}] 状态: ${status} | 进度: ${progress}%${error_message ? ` | 错误: ${error_message}` : ''}`);

  if (TERMINAL_STATES.includes(status)) {
    if (status === 'completed' && fetchResult) {
      // 自动获取审核结果
      console.error('[视频审核轮询] 任务完成，正在获取审核结果...');
      const resultData = await callAPI('/openapi/v1/video-script-audit/tasks/result', {
        task_id: taskId,
      });
      console.log(JSON.stringify(resultData, null, 2));
      process.exit(0);
    }

    // 失败或不需要获取结果
    console.log(JSON.stringify(statusResult, null, 2));
    process.exit(status === 'completed' ? 0 : 1);
  }

  if (attempt < maxAttempts) {
    await sleep(interval);
  }
}

// 超过最大轮询次数
console.error(`[视频审核轮询] 已达最大轮询次数 ${maxAttempts}（共等待 ${maxAttempts * interval} 秒），任务仍在处理中`);
console.log(JSON.stringify({
  success: false,
  error: { message: `轮询超时：已等待 ${maxAttempts * interval} 秒，任务仍未完成。建议稍后使用 video_audit_status.mjs 手动查询。` },
  data: { task_id: taskId },
}));
process.exit(1);
