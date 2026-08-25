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
| **链路1（社媒 URL）** | 传 `video_url`，后端自动下载 | 已发布视频的拆解与竞品分析 | ✅ 反查粉丝/均播/爆款等级 |
| **链路2（上传素材）** | 先调 `media_upload.mjs` 拿 `oss_url`，再传 `oss_url` | 发布前脚本自审，无需社媒链接 | `not_applicable`（天然无社媒身份，非数据缺失） |

**调用流程**：

```
链路1: submit(video_url) → poll(status) → result
链路2: media_upload → submit(oss_url) → poll(status) → result
```

任意一条链路固定计费 **100 credits/次**（submit）+ 链路2 额外 **20 credits**（media_upload），与视频时长无关。

## 脚本引用

| # | 脚本 | 相对路径 | 状态 | 说明 |
|---|------|----------|------|------|
| 1 | media_upload.mjs | `../../scripts/media_upload.mjs` | ✅ | 链路2：上传本地视频 → 公开桶，返回 oss_url（20 credits/次） |
| 2 | video_audit_submit.mjs | `../../scripts/video_audit_submit.mjs` | ✅ | 提交审核任务（链路1传 video_url，链路2传 oss_url），返回 task_id |
| 3 | video_audit_status.mjs | `../../scripts/video_audit_status.mjs` | ✅ | 单次查询状态，不轮询 |
| 4 | video_audit_result.mjs | `../../scripts/video_audit_result.mjs` | ✅ | 拉取审核结果，仅 completed 时可用 |
| 5 | video_audit_poll.mjs | `../../scripts/video_audit_poll.mjs` | ✅ | 自动轮询直到终态，可选自动取结果 |

## 异步任务生命周期

| 状态 | 含义 | 是否终态 |
|------|------|---------|
| `pending` | 队列中，未开始处理 | ❌ 继续轮询 |
| `processing` | 处理中（下载 / 分析 / 入库） | ❌ 继续轮询 |
| `completed` | 已完成，可调用 result 获取审核 JSON | ✅ |
| `failed` | 失败，`error_message` 含失败原因（**必须原文透传给用户**，见「失败态处理（强制）」） | ✅ |

`progress` 字段语义：`pending=0` / `processing=50` / `completed=100` / `failed=0`。**不要根据 progress 判断终态**，只能根据 `status`。

> **[禁止] `progress: 100` 但 `status: processing` 时报告"完成"。** 必须等 `status` 实际变为 `completed` 后才能调 result 取数。

> **建议轮询间隔**：10 秒。`video_audit_poll.mjs` 默认 `interval=10`、`max_attempts=40`，最多等 400 秒；超时后引导用户改用 `video_audit_status.mjs` 手动查询。

## 提交参数（video_audit_submit.mjs）

`video_url` 和 `oss_url` 二选一，不可同时为空，也不可同时传。参数名与后端 `SubmitAuditTaskRequest` 一致。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `video_url` | string | △ | 链路1：社媒视频 URL，必须匹配下方白名单 |
| `oss_url` | string | △ | 链路2：`media_upload.mjs` 返回的**完整** `oss_url`，必须是 `*.creativault.tech` 下的 HTTPS URL |
| `brief` | string | × | 客户 Brief 原文，启用 Brief 符合度审核（`brief_compliance`） |
| `user_id` | string | × | 业务用户 ID；不传则后端使用 `X-User-Identity` |
| `campaign_id` | string | × | 活动 / 战役 ID，用于结果归档 |
| `audit_mode` | string | × | 审核严格度：`high`（默认）/ `low` |
| `is_benchmark` | boolean | × | 是否标记为优质案例存入 benchmark 库；`true` 时会忽略 `enable_benchmark` |
| `enable_benchmark` | boolean | × | 是否启用 benchmark 对比，默认 `false` |

> △ `video_url` 和 `oss_url` 必须恰好传一个：都不传或都传，后端 `model_validator` 都会拒绝。

**已废弃的旧参数名**

| 旧名 | 处理 |
|------|------|
| `url` | 自动映射为 `video_url`，可继续用但不推荐 |
| `oss_url_override` | 自动映射为 `oss_url`，可继续用但不推荐 |
| `uploaded_oss_key` | **不再接受**。它是 OSS key 而非完整 URL，后端只认 URL。请改传 `media_upload.mjs` 返回的 `oss_url` |

### URL 白名单（链路1 强制）

只有以下三种格式会被接受，`video_audit_submit.mjs` 在提交前本地校验，后端 submit 也会二次校验：

| 平台 | 接受的格式 | 示例 |
|------|-----------|------|
| TikTok | `tiktok.com/@{username}/video/{数字ID}` | `https://www.tiktok.com/@creator/video/7648432916250250526` |
| YouTube Shorts | `youtube.com/shorts/{id}` 或 `youtu.be/{id}` | `https://www.youtube.com/shorts/abc123` |
| Instagram Reels | `instagram.com/reel/{code}`、`/reels/{code}`、`/p/{code}` | `https://www.instagram.com/reel/Cxyz_1/` |

**常见不支持的形态**（遇到这些不要提交，直接向用户要正确链接）：

| 用户给的链接 | 为什么不行 | 怎么办 |
|-------------|-----------|--------|
| `youtube.com/watch?v=xxx` | YouTube **长视频页**，只支持 Shorts | 让用户确认是否为 Shorts；长视频当前不支持分析 |
| `vt.tiktok.com/xxx`、`vm.tiktok.com/xxx` | TikTok 分享**短链**，无法识别 | 让用户在浏览器打开后复制完整链接 |
| `douyin.com/video/xxx` | 抖音不在支持范围 | 说明仅支持海外三平台 |
| 达人主页链接（无 `/video/`） | 不是单条视频链接 | 让用户提供具体某条视频的链接 |

**[强制规则]**

1. boolean 参数必须传 JSON boolean（`true`/`false`），不要传 `"true"`、`1`、`0`。
2. `audit_mode` 只接受 `high` / `low`，不要传 `medium`（后端已不支持）。
3. 一次只能审核一条视频；批量审核由调用方循环管理 task_id。
4. 同一视频重复 submit 会重复扣 100 credits/次，失败后查 `error_message` 而不是重新 submit。
5. **提交前必须核对上方 URL 白名单。** 不匹配时禁止提交，直接把不支持的原因和正确格式告知用户并索取新链接。提交也会被拒（`40004`），但会白跑一次请求。

**示例**

```bash
# 链路1：最小参数
node ../../scripts/video_audit_submit.mjs '{"video_url":"https://www.tiktok.com/@creator/video/7648432916250250526"}'

# 链路1：带 Brief + benchmark 对比
node ../../scripts/video_audit_submit.mjs '{"video_url":"https://www.tiktok.com/@creator/video/123","brief":"给职场妈妈的 SLG 手游，5 分钟一局","audit_mode":"high","enable_benchmark":true}'

# 链路2：先上传，再审核（两步）
node ../../scripts/media_upload.mjs '{"file_path":"/path/to/draft.mp4"}'
# → 从响应里取 oss_url（不是 oss_key）: "https://oss.creativault.tech/media_ingestion/uploads/user@example.com/20260615_a1b2.mp4"
node ../../scripts/video_audit_submit.mjs '{"oss_url":"https://oss.creativault.tech/media_ingestion/uploads/user@example.com/20260615_a1b2.mp4","brief":"发布前自审","audit_mode":"high"}'
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

将返回的 **`oss_url`**（不是 `oss_key`）作为 `video_audit_submit.mjs` 的 `oss_url` 传入。`oss_key` 仅用于上传结果追踪，后端 submit 不接受它。**计费 20 credits/次**（与文件大小无关）。

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

## 失败态处理（强制）

**核心原则：`success` 字段只代表 HTTP 请求本身是否成功，不代表视频审核任务是否成功。**

这条链路有三种失败，来源和读取字段都不同，**任何一种都必须把失败原因原文告知用户**：

| 失败阶段 | 判定方式 | 原因字段 | 脚本输出的 `failure_stage` |
|---------|---------|---------|--------------------------|
| 本地校验 | 脚本未发出请求就退出 | `error` + `reason` | `local_validation` |
| 提交阶段 | `success: false` | `error`（顶层字符串） | 无（`_api_client.mjs` 直接输出） |
| 任务阶段 | `success: true` 且 `data.status === "failed"` | `data.error_message` | `audit_task` |
| 轮询超时 | 脚本达到 max_attempts | `error` | `poll_timeout` |

### [禁止] 只看外层 success 就当成功

```jsonc
// 这是一次「失败」的响应，不是成功
{
  "success": true,                  // ← 只说明状态查询这个 HTTP 请求成功了
  "data": {
    "status": "failed",             // ← 真正的任务状态在这里
    "error_message": "不支持的视频 URL（仅支持 TikTok / YouTube Shorts / Instagram Reels）: ..."
  }
}
```

### [必须] 遵守的四条

1. 拿到任何响应，先看 `data.status`，再看外层 `success`。
2. `data.status === "failed"` 时，**必须**把 `data.error_message` 原文展示给用户。禁止只回复「分析失败」「处理出错」这类无信息量的话。
3. 脚本**退出码非 0** 时，禁止报告「任务处理中」或静默重试。必须先读 stdout / stderr 里的 `error` 字段，拿到原因再回复用户。
4. 脚本输出里若含 `action_required` 字段，按该字段要求执行。

### 失败呈现模板

```
❌ 视频审核未完成
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
失败阶段: {本地校验 / 提交 / 任务执行 / 轮询超时}
失败原因: {error 或 data.error_message 原文}
{如有 reason 字段，追加一行说明}
{如有 supported_formats，列出正确格式}

下一步: {向用户索取符合格式的链接 / 稍后重查 task_id / 充值}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

> 失败原因是后端唯一告诉用户「为什么没结果」的渠道。含糊掉它，用户只能看到扣了积分却没有报告。

## 错误码（视频审核专属）

同一个 code 在不同端点语义不同，**必须按调用的端点判断**：

| code | 端点 | 场景 | 处置 |
|------|------|------|------|
| 40004 | `/tasks/submit` | 视频 URL 不在平台白名单 | 不重试。把原因和正确格式告知用户，索取新链接。不扣积分 |
| 40001 | `/tasks/submit` | 请求参数无效（如 `video_url` / `oss_url` 未二选一） | 调用方传参问题，修正参数后重试 |
| 40001 | `/tasks/status`、`/tasks/result` | 任务不存在（task_id 无效） | 检查 task_id 是否拼错 / 是否本租户提交 |
| 40002 | `/tasks/result` | 任务未完成（status ≠ completed） | 不要报错给用户，先调 status / poll 等待 |
| 40003 | `/tasks/result` | 审核结果不存在（已被清理） | 重新 submit；旧 task 不再可恢复 |
| 40201 | `/tasks/submit` | 积分不足 | 提示充值，不要重试 |

### 任务阶段失败原因（`data.error_message`）

这些不是错误码，是 worker 执行过程中的失败，只能从 `error_message` 读取：

| 原因文案关键词 | 含义 | 处置 |
|--------------|------|------|
| 不支持的视频 URL | URL 不在白名单 | 索取符合白名单的链接 |
| 视频时长 … 超过限制 600s | 视频超过 10 分钟 | 说明当前只支持 10 分钟以内的短视频 |
| 视频文件大小 … 超过限制 500MB | 文件超限 | 换更小的素材，或改用链路2 上传压缩版 |
| 下载失败 / not_found / invalid | 视频已删除、私密或下载服务异常 | 确认链接仍可公开访问；可稍后重试 |

> 遇到不在上表的 `error_message`，**原文透传给用户**，不要归类成「未知错误」后丢弃原文。

通用错误码（40101 / 42901 / 50001 等）见 `references/error-codes.md`。

## 推荐工作流

### 链路1：单条已发布视频审核（最常见）

```bash
# 1. 提交（拿 task_id）
node ../../scripts/video_audit_submit.mjs '{"video_url":"https://www.tiktok.com/@creator/video/123","enable_benchmark":true}'

# 2. 轮询并自动取结果（推荐）
node ../../scripts/video_audit_poll.mjs '{"task_id":"<上一步返回的 task_id>"}'
```

### 链路2：发布前本地视频自审（两步）

```bash
# 1. 上传本地视频 → 公开桶（20 credits）
node ../../scripts/media_upload.mjs '{"file_path":"/path/to/draft.mp4"}'
# 输出中拿 oss_url，如: "https://oss.creativault.tech/media_ingestion/uploads/user@example.com/20260615_a1b2.mp4"

# 2. 提交审核（100 credits），传 oss_url
node ../../scripts/video_audit_submit.mjs '{"oss_url":"https://oss.creativault.tech/media_ingestion/uploads/user@example.com/20260615_a1b2.mp4","brief":"发布前自审","audit_mode":"high"}'

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
| 商单链接 | 提交时的 `video_url` | 原始输入 |
| 内容类型 | `content_type_label` | 6 个固定类目值之一；链路2 同样分析 |
| 作品分析 | `structured_analysis` | 拼接三段式：场景/需求切入点、拍摄呈现亮点、标题引导/CTA亮点 |
| 结构拆解 | `storyboard.script_structure` + `storyboard.shots[]` | Hook → Body(分段) → CTA + 分镜数 |
| 核心标签 | `hashtags` | 逗号分隔；无则为 `—` |
| HTML 报告 | `html_report_url` | 可选追加到表格末尾列 |

**通用规则**：

- 任务失败时不要套用上面的成功模板，改用「失败态处理（强制）」章节的失败呈现模板，并原文带上失败原因。
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
