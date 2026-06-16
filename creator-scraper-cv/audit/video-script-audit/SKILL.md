---
name: video-script-audit
description: |
  CreatiVault official video script audit skill. MUST be used when the user wants to analyze,
  audit, deconstruct, score, benchmark, or break down short videos on TikTok,
  Instagram Reels, or YouTube Shorts. Supports single video and batch concurrent audit
  (AI Agent orchestrates parallel submit/poll/result via Promise.all). After analysis,
  outputs structured results as a Feishu-compatible backfill table with fields:
  平台 / 达人ID / 主页链接 / 达人类型 / 商单链接 / 内容类型 / 作品分析 / 结构拆解 / 核心标签.
  Calls CreatiVault OpenAPI video-script-audit endpoints
  (submit/status/result) through the local video_audit_*.mjs scripts as the authoritative
  source. Do not use web search, screenshot OCR, or hand-written analysis as a fallback unless
  the user explicitly asks for non-API analysis.
  Use when: video audit, video analysis, script breakdown, storyboard, hook analysis,
  viral factors, content audit, benchmark comparison, video diagnosis, video scoring,
  TikTok video analysis, Reels analysis, Shorts analysis, brief compliance check,
  视频审核, 视频脚本审核, 视频拆解, 分镜拆解, 爆款拆解, 爆款因子, 钩子分析, 选题拆解,
  情绪价值分析, 镜头语言分析, 文案拆解, 商业价值分析, 痛点分析, 卖点植入分析, Brief 符合度,
  Benchmark 对标, 视频诊断, 视频评分, 短视频拆解, 批量拆解, 回填表, 达人回填,
  TikTok 视频拆解, Reels 拆解, Shorts 拆解.
  视频脚本审核能力，提交单条或批量短视频 URL 后，后端在约 3-5 分钟内完成 12 维度结构化拆解
  （Hook / 选题 / 痛点 / 内容结构 / 产品植入 / 情绪价值 / 镜头语言 / 文案 / 商业价值 /
  基础数据 / 账号背景 / 互动设计），可选 Brief 符合度审核与 benchmark 对标。
  v2.1 新增：hashtags 核心标签、content_type_label 内容类型、structured_analysis 作品分析、
  creator_type 达人类型。支持批量并发审核 + 飞书回填表输出。
  异步三端点：submit → status → result，固定计费 100 credits/次。
  Use when: 视频审核, 视频脚本拆解, 爆款拆解, 批量审核, 回填表, video audit,
  video script analysis, viral breakdown, batch audit, backfill table
compatibility: Node.js 20.6+
metadata:
  layer: audit
  parent: creator-scraper-cv
---

# Video Script Audit（视频脚本审核）

## 概述

支持两条摄入链路，后端异步执行 12 维度结构化拆解：

| 链路 | 方式 | 适用场景 | 达人数据维度 |
|------|------|---------|------------|
| **链路1（社媒 URL）** | 传 `url`，后端自动下载 | 已发布视频的拆解与竞品分析 | ✅ 反查粉丝/均播/爆款等级 |
| **链路2（上传素材）** | 先调 `media_upload.mjs` 拿 `oss_key`，再传 `uploaded_oss_key` | 发布前脚本自审，无需社媒链接 | `not_applicable`（天然无社媒身份，非数据缺失） |

**调用流程**：

```
链路1: submit(url) → poll(status) → result
链路2: media_upload → submit(uploaded_oss_key) → poll(status) → result
```

任意一条链路固定计费 **100 credits/次**（submit）+ 链路2 额外 **20 credits**（media_upload），与视频时长无关。

## 脚本引用

| # | 脚本 | 相对路径 | 状态 | 说明 |
|---|------|----------|------|------|
| 1 | media_upload.mjs | `../../scripts/media_upload.mjs` | ✅ | 链路2：上传本地视频 → 公开桶，返回 oss_key（20 credits/次） |
| 2 | video_audit_submit.mjs | `../../scripts/video_audit_submit.mjs` | ✅ | 提交审核任务（链路1传 url，链路2传 uploaded_oss_key），返回 task_id |
| 3 | video_audit_status.mjs | `../../scripts/video_audit_status.mjs` | ✅ | 单次查询状态，不轮询 |
| 4 | video_audit_result.mjs | `../../scripts/video_audit_result.mjs` | ✅ | 拉取审核结果，仅 completed 时可用 |
| 5 | video_audit_poll.mjs | `../../scripts/video_audit_poll.mjs` | ✅ | 自动轮询直到终态，可选自动取结果 |

## 异步任务生命周期

| 状态 | 含义 | 是否终态 |
|------|------|---------|
| `pending` | 队列中，未开始处理 | ❌ 继续轮询 |
| `processing` | 处理中（下载 / 分析 / 入库） | ❌ 继续轮询 |
| `completed` | 已完成，可调用 result 获取审核 JSON | ✅ |
| `failed` | 失败，`error_message` 含失败原因 | ✅ |

`progress` 字段语义：`pending=0` / `processing=50` / `completed=100` / `failed=0`。**不要根据 progress 判断终态**，只能根据 `status`。

> **[禁止] `progress: 100` 但 `status: processing` 时报告"完成"。** 必须等 `status` 实际变为 `completed` 后才能调 result 取数。

> **建议轮询间隔**：10 秒。`video_audit_poll.mjs` 默认 `interval=10`、`max_attempts=40`，最多等 400 秒；超时后引导用户改用 `video_audit_status.mjs` 手动查询。

## 提交参数（video_audit_submit.mjs）

`url` 和 `uploaded_oss_key` 二选一，不可同时为空，也不可同时传。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `url` | string | △ | 链路1：社媒视频 URL（TikTok / Instagram Reels / YouTube Shorts） |
| `uploaded_oss_key` | string | △ | 链路2：已上传素材的 OSS key，由 `media_upload.mjs` 返回 |
| `brief` | string | × | 客户 Brief 原文，启用 Brief 符合度审核（`brief_compliance`） |
| `user_id` | string | × | 业务用户 ID；不传则后端使用 `X-User-Identity` |
| `campaign_id` | string | × | 活动 / 战役 ID，用于结果归档 |
| `audit_mode` | string | × | 审核严格度：`high`（默认）/ `low` |
| `is_benchmark` | boolean | × | 是否标记为优质案例存入 benchmark 库；`true` 时会忽略 `enable_benchmark` |
| `enable_benchmark` | boolean | × | 是否启用 benchmark 对比，默认 `false` |
| `oss_url_override` | string | × | [旧 Workaround] 跳过下载；新接入推荐用 `uploaded_oss_key` |

> △ `url` 和 `uploaded_oss_key` 至少传一个。

**[强制规则]**

1. boolean 参数必须传 JSON boolean（`true`/`false`），不要传 `"true"`、`1`、`0`。
2. `audit_mode` 只接受 `high` / `low`，不要传 `medium`（后端已不支持）。
3. 一次只能审核一条视频；批量审核由调用方循环管理 task_id。
4. 同一视频重复 submit 会重复扣 100 credits/次，失败后查 `error_message` 而不是重新 submit。

**示例**

```bash
# 链路1：最小参数
node ../../scripts/video_audit_submit.mjs '{"url":"https://www.tiktok.com/@creator/video/7648432916250250526"}'

# 链路1：带 Brief + benchmark 对比
node ../../scripts/video_audit_submit.mjs '{"url":"https://www.tiktok.com/@creator/video/123","brief":"给职场妈妈的 SLG 手游，5 分钟一局","audit_mode":"high","enable_benchmark":true}'

# 链路2：先上传，再审核（两步）
node ../../scripts/media_upload.mjs '{"file_path":"/path/to/draft.mp4"}'
# → 返回 oss_key: "media_ingestion/uploads/user@example.com/20260615_a1b2.mp4"
node ../../scripts/video_audit_submit.mjs '{"uploaded_oss_key":"media_ingestion/uploads/user@example.com/20260615_a1b2.mp4","brief":"发布前自审","audit_mode":"high"}'
```
```

**提交响应**

```json
{
  "success": true,
  "data": {
    "task_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "processing",
    "estimated_time_seconds": 240
  },
  "meta": {
    "request_id": "req_abc123",
    "quota_remaining": 991,
    "credits_consumed": 100
  }
}
```

## 上传本地视频（media_upload.mjs）

链路2 专用。上传本地视频文件 → 公开桶，返回 `oss_key`。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file_path` | string | ✓ | 本地视频文件绝对路径，支持 mp4/mov/avi/mkv/webm，≤ 500MB |

```bash
node ../../scripts/media_upload.mjs '{"file_path":"/path/to/video.mp4"}'
```

**响应**

```json
{
  "success": true,
  "data": {
    "oss_key": "media_ingestion/uploads/user@example.com/20260615_103000_a1b2c3d4.mp4",
    "oss_url": "https://oss.creativault.tech/media_ingestion/uploads/.../a1b2c3d4.mp4",
    "filename": "video.mp4",
    "size_bytes": 9969532
  },
  "meta": { "credits_consumed": 20 }
}
```

将返回的 `oss_key` 作为 `video_audit_submit.mjs` 的 `uploaded_oss_key` 传入。**计费 20 credits/次**（与文件大小无关）。

## 状态查询（video_audit_status.mjs）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `task_id` | string | ✓ | 任务 UUID（来自 submit 响应） |

```bash
node ../../scripts/video_audit_status.mjs '{"task_id":"550e8400-e29b-41d4-a716-446655440000"}'
```

返回 `status` / `progress` / `created_at` / `completed_at` / `error_message`。状态查询本身不计费，但仍占用日 quota。

## 自动轮询（video_audit_poll.mjs）

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `task_id` | string | — | 必填 |
| `interval` | integer | 10 | 轮询间隔秒数 |
| `max_attempts` | integer | 40 | 最大轮询次数。默认 40 × 10s = 400s ≈ 6.7 分钟 |
| `fetch_result` | boolean | true | 终态为 completed 时是否自动调 result |

```bash
# 轮询 + 自动取结果（推荐）
node ../../scripts/video_audit_poll.mjs '{"task_id":"550e8400-e29b-41d4-a716-446655440000"}'

# 长任务：把单次审核的轮询时长拉到 15 分钟
node ../../scripts/video_audit_poll.mjs '{"task_id":"xxx","interval":15,"max_attempts":60}'

# 只等终态，不自动取结果（result 由调用方控制）
node ../../scripts/video_audit_poll.mjs '{"task_id":"xxx","fetch_result":false}'
```

**行为**：

- 进度日志输出到 stderr（`[轮询 N/M] 状态: ... | 进度: ...%`），不污染 stdout JSON。
- 终态为 `completed` 且 `fetch_result=true` 时，stdout 输出完整 result JSON。
- 终态为 `failed` 或超时，stdout 输出 status JSON，进程退出码 `1`。
- 默认 400 秒覆盖大部分视频；显著超时（高峰期 / 大文件）应增大 `max_attempts`，不要默认推断"任务卡死"。

## 获取结果（video_audit_result.mjs）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `task_id` | string | ✓ | 任务 UUID，必须 `status=completed` |

```bash
node ../../scripts/video_audit_result.mjs '{"task_id":"550e8400-e29b-41d4-a716-446655440000"}'
```

**响应结构（v2.1 含回填表扩展字段）**

```json
{
  "success": true,
  "data": {
    "task_id": "550e8400-...",
    "audit_result": {
      "storyboard": { "...": "..." },
      "viral_factors": { "...": "..." },
      "content_audit": { "...": "..." },
      "benchmark_comparison": { "...": "..." },
      "suggestions": [ "..." ],
      "scores": { "...": "..." },
      "confidence": { "...": "..." },
      "diagnosis_level": "average",
      "creator_metadata": {
        "nick_name": "Kirsten Gutierrez",
        "followers_cnt": 300800,
        "creator_type": "母婴达人",
        "creator_type_reason": "..."
      },
      "video_metrics": { "...": "..." },
      "hashtags": ["#momlife", "#babygear"],
      "content_type_label": "宝妈情绪消减",
      "content_type_reason": "视频聚焦宝妈日常疲惫与清洁焦虑...",
      "structured_analysis": {
        "scene_pain_point": "奶瓶清洗费时费力...",
        "filming_highlights": "用真实带娃场景+脏污特写...",
        "cta_highlights": ""
      }
    },
    "html_report_url": "https://oss.creativault.tech/video_audit/reports/20260612_073240_4a1f3840.html",
    "hashtags": ["#momlife", "#babygear"],
    "content_type_label": "宝妈情绪消减",
    "content_type_reason": "...",
    "structured_analysis": { "...": "..." }
  }
}
```

> `html_report_url` 为客户级 HTML 报告的公开 URL（`https://oss.creativault.tech/video_audit/reports/{ts}_{id}.html`），无需鉴权可直接访问。任务正常完成后返回真实 URL；HTML 生成失败（极少数情况）时为 `null`，不影响 `audit_result` 主结果。

## 审核结果字段速查

### 原始 12 维度

| # | 维度 | 字段路径 | 关键子字段 |
|---|------|----------|-----------|
| 1 | 基础数据 | `audit_result.video_metrics` | `views_cnt` / `likes_cnt` / `interaction_rate` / `viral_level` |
| 2 | 账号背景 | `audit_result.creator_metadata` | `nick_name` / `followers_cnt` / `last10_avg_views` / `last10_avg_interaction_rate` |
| 3 | Hook 拆解 | `audit_result.viral_factors.hook_analysis` | `hook_type` / `strength_score` / `hook_script` / `first_frame_visual` |
| 4 | 选题拆解 | `audit_result.storyboard.content_theme` + `user_need_type` | 痛点驱动 / 需求驱动 / 趋势借势 / 热点蹭流 |
| 5 | 用户痛点 | `audit_result.viral_factors.pain_point_targeting` | `targeted_pain_points`（区分 explicit/implicit）/ `resonance_score` |
| 6 | 内容结构 | `audit_result.storyboard.script_structure` | `hook` / `body[]` / `cta` |
| 7 | 产品植入 | `audit_result.viral_factors.selling_point_integration` | `integration_points[]` / `brand_mention_count` / `first_brand_appearance_time` |
| 8 | 情绪价值 | `audit_result.viral_factors.emotional_value` | `core_emotion` / `emotional_triggers[]` / `emotional_arc` / `resonance_score` |
| 9 | 镜头语言 | `audit_result.storyboard.shots[]` + `cinematography_stats` | `shot_count` / `avg_shot_duration` / `cut_frequency` / `dominant_shot_type` |
| 10 | 文案拆解 | `audit_result.script_analysis` | `high_freq_words[]` / `high_conversion_phrases[]` |
| 11 | 商业价值 | `audit_result.viral_factors.conversion_completeness` | `has_clear_cta` / `cta_strength` / `conversion_funnel_design` |
| 12 | 互动设计 | 评论区数据当前不可用 | 后续版本补 |

### v2.1 回填表扩展字段

| # | 字段 | 路径 | 类型 | 说明 |
|---|------|------|------|------|
| 13 | 核心标签 | `audit_result.hashtags` / 顶层 `hashtags` | string[] | 视频所带 hashtag 列表 |
| 14 | 内容类型 | `audit_result.content_type_label` / 顶层 `content_type_label` | string | `产品测评` / `强力清洁` / `突出大容量` / `宝妈情绪消减` / `奶爸轻松上手` / `其他` |
| 15 | 内容类型依据 | `audit_result.content_type_reason` | string | 分类简要说明 |
| 16 | 作品分析 | `audit_result.structured_analysis` / 顶层 `structured_analysis` | object | `{scene_pain_point, filming_highlights, cta_highlights}` |
| 17 | 达人类型 | `audit_result.creator_metadata.creator_type` | string \| null | `母婴达人` / `母婴专家` / `新手妈妈` / `生活达人` / `美妆达人` / `知识博主` / `未分类` |
| 18 | 达人类型依据 | `audit_result.creator_metadata.creator_type_reason` | string \| null | 分类依据 |

> 飞书 12 维需求中的"评论区互动数据"目前后端尚未支持，遇到该需求时显式说明能力缺失，不要凭 `viral_factors` 其它字段编造。

## 关键评分字段

| 字段 | 范围 | 含义 |
|------|------|------|
| `audit_result.scores.overall_score` | 0~10 | 综合评分（subscores 加权平均） |
| `audit_result.scores.subscores.hook_strength` | 0~10 | 钩子强度，`0` = 完全无钩子 |
| `audit_result.scores.subscores.rhythm_design` | 0~10 | 节奏设计 |
| `audit_result.scores.subscores.selling_point_delivery` | 0~10 | 卖点传递 |
| `audit_result.scores.subscores.creative_highlight` | 0~10 | 创意亮点 |
| `audit_result.scores.subscores.production_quality` | 0~10 | 制作质量 |
| `audit_result.diagnosis_level` | enum | `excellent` / `good` / `average` / `weak` / `critical` |
| `audit_result.confidence.overall_confidence` | 0~1 | 整体置信度，<0.6 建议提示需要人工复核 |
| `audit_result.confidence.requires_human_review` | boolean | 后端判定的人工复核标志 |

## 错误码（视频审核专属）

| code | 场景 | 处置 |
|------|------|------|
| 40001 | 任务不存在（task_id 无效） | 检查 task_id 是否拼错 / 是否本租户提交 |
| 40002 | 任务未完成（status ≠ completed） | 不要立刻报错给用户，先调 status / poll 等待 |
| 40003 | 审核结果不存在（已被清理） | 重新 submit；旧 task 不再可恢复 |
| 40201 | 积分不足（提交时） | 提示充值，不要重试 |

通用错误码（40101 / 42901 / 50001 等）见 `references/error-codes.md`。

## 推荐工作流

### 链路1：单条已发布视频审核（最常见）

```bash
# 1. 提交（拿 task_id）
node ../../scripts/video_audit_submit.mjs '{"url":"https://www.tiktok.com/@creator/video/123","enable_benchmark":true}'

# 2. 轮询并自动取结果（推荐）
node ../../scripts/video_audit_poll.mjs '{"task_id":"<上一步返回的 task_id>"}'
```

### 链路2：发布前本地视频自审（两步）

```bash
# 1. 上传本地视频 → 公开桶（20 credits）
node ../../scripts/media_upload.mjs '{"file_path":"/path/to/draft.mp4"}'
# 输出中拿 oss_key，如: "media_ingestion/uploads/user@example.com/20260615_a1b2.mp4"

# 2. 提交审核（100 credits），传 uploaded_oss_key
node ../../scripts/video_audit_submit.mjs '{"uploaded_oss_key":"media_ingestion/uploads/.../20260615_a1b2.mp4","brief":"发布前自审","audit_mode":"high"}'

# 3. 轮询取结果
node ../../scripts/video_audit_poll.mjs '{"task_id":"<step 2 返回的 task_id>"}'
```

> 链路2 结果中 `creator_metadata.status` 和 `video_metrics.status` 均为 `not_applicable`——这是正常现象，上传素材天然没有社媒身份，不是数据缺失。

### 已有 task_id，只想拿结果

```bash
node ../../scripts/video_audit_status.mjs '{"task_id":"xxx"}'
# status=completed 后再取
node ../../scripts/video_audit_result.mjs '{"task_id":"xxx"}'
```

### 批量并发审核（v2.1 回填表需求）

后端单次只支持 1 条视频审核，Skill 侧通过 async/await 并发提交多条来实现批量审核。

**并发策略**（由 AI Agent 自主调度）：

| 视频数量 | 并发策略 | 说明 |
|---------|---------|------|
| 1 条 | 单条 submit → poll → result | 同链路1 |
| 2-5 条 | 全并发 | 同时 submit 所有 URL，各自独立 poll |
| 6-20 条 | 分 3 批并发（每批 ≤7） | 每批全量 submit → 同时 poll 本批所有 task |
| >20 条 | 分 N 批，每批 ≤10 | 用户确认后再继续，避免长时间等待 |

**并发实现要点**：
```
1. 收集所有 URL → 同时 submit（Promise.all）
2. 收集所有返回的 task_id → 同时 poll（Promise.all，各自独立轮询）
3. 所有 completed 后 → 同时 fetch result（Promise.all）
4. 汇总结果 → 输出回填表
```

**注意事项**：
- 并发 submit 使用 `Promise.all`，不是串行 `for` 循环
- 每条视频独立 poll，不要等一条完成再提交下一条
- poll 超时（400s 默认）的 task 单独提示，不阻塞已完成的任务
- submit 失败（40201 积分不足 / 40001 参数错）单独提示，不影响其它
- 批量 submit 总积分消耗 = 100 credits × 视频数量

## 结果呈现

### 单条视频结果

向用户呈现已分析完毕的审核结果，包含 HTML 报告链接：

```
🎬 视频审核报告
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
基础信息
  达人: {creator_metadata.nick_name} ({followers_cnt} 粉)
  视频: {video_metrics.video_id} | 播放 {views_cnt} | 互动率 {interaction_rate}
  爆款等级: {viral_level} | 诊断: {diagnosis_level}
  内容类型: {content_type_label}

综合评分: {scores.overall_score}/10
  钩子 {hook_strength} | 节奏 {rhythm_design} | 卖点 {selling_point_delivery}
  亮点 {creative_highlight} | 转化 {conversion_guidance} | 制作 {production_quality}

Hook 拆解
  类型: {hook_analysis.hook_type} | 强度: {strength_score}/10
  口播首句: {hook_script}
  首屏画面: {first_frame_visual}

爆款因子
  痛点: {pain_point_targeting.targeted_pain_points[].description}
  情绪: {emotional_value.core_emotion} (共鸣 {resonance_score}/10)
  植入: 首次出现 {first_brand_appearance_time}s | 共 {brand_mention_count} 次

优化建议（按 P0 → P2）
  - [P0] {suggestions[i].problem_description} → {how_to_fix}
  - [P1] ...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 HTML 报告: {html_report_url}
信息: 消耗 100 credits | request_id: {meta.request_id}
```

### 批量结果 → 回填表（飞书表格格式）

对**批量审核**或用户明确要求"回填表"时，以飞书兼容的 markdown 表格输出以下字段：

```
| 平台 | 达人ID | 主页链接 | 达人类型 | 商单链接 | 内容类型 | 作品分析 | 结构拆解 | 核心标签 |
|------|--------|---------|---------|---------|---------|---------|---------|---------|
```

**字段映射规则**：

| 回填表字段 | 数据来源（audit_result） | 取值逻辑 |
|-----------|------------------------|---------|
| 平台 | URL 域名 | `tiktok` / `youtube` / `instagram` / `user_upload` |
| 达人ID | `creator_metadata.union_user_id` 或 URL 中的 username | 优先 `union_user_id`，降级从 URL 提取 |
| 主页链接 | 拼装：`https://www.{platform}.com/@{username}` | 链路2 为 `—` |
| 达人类型 | `creator_metadata.creator_type` | `creator_type_reason` 作为备注；链路2 为 `—` |
| 商单链接 | 提交时的 `url` 或 submitted URL | 原始输入 |
| 内容类型 | `content_type_label` | 6 个固定类目值之一；链路2 同样分析 |
| 作品分析 | `structured_analysis` | 拼接三段式：场景/需求切入点、拍摄呈现亮点、标题引导/CTA亮点 |
| 结构拆解 | `storyboard.script_structure` + `storyboard.shots[]` | Hook → Body(分段) → CTA + 分镜数 |
| 核心标签 | `hashtags` | 逗号分隔；无则为 `—` |
| HTML 报告 | `html_report_url` | 可选追加到表格末尾列 |

**通用规则**：

- 仅展示实际返回的字段，缺字段不要捏造（特别是 benchmark / brief_compliance 关闭时为空）。
- `confidence.requires_human_review=true` 时在报告顶部加显式提示。
- 任何 `*_score` 为 `null` 时跳过，不要替换为 `0` 或"未知"。
- 批量结果表格中，`作品分析` 和 `结构拆解` 字段较长时建议截取关键信息 + 标注"详见 HTML 报告"。
- 输出后主动询问是否需要：① 进一步解释某个维度；② 拉同账号其它视频对比；③ 把建议导出。

## 积分与 quota 规则（强制）

- `meta.credits_consumed=100` 仅出现在 submit 成功响应中；status / result / poll 不再扣费。
- `meta.quota_remaining` 是当天 OpenAPI 请求次数余量，不是积分余额。即使值很小或为 0，也禁止解释为"积分不足"。
- 仅当后端返回错误码 `40201` 时才能提示"积分不足"。
- `40002`（任务未完成）属于业务状态，**不**计入失败重试，应继续等待，不要中断流程。

## 与其它子 skill 的衔接

| 上游 / 下游 | 衔接点 |
|------------|--------|
| `discovery/creator-search` | 搜索到爆款达人后，对其代表视频做拆解 |
| `discovery/creator-lookalike` | 拿到 lookalike 达人后，挑爆款视频拆解作为 brief 参考 |
| `collection/creator-collection` | 批量采集后挑选高互动视频做单条审核 |
| `outreach/creator-outreach` | 审核报告作为合作邮件中的"内容评价"附件输入 |

## References

- [API Reference](../../references/api-reference.md)
- [Error Codes](../../references/error-codes.md)
