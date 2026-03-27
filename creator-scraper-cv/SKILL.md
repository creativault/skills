---
name: creator-scraper-cv
description: |
  Creativault 达人数据采集 Skill。搜索和采集 TikTok、YouTube、Instagram 平台的达人数据，
  支持多维度筛选搜索、链接/用户名/关键词批量采集、任务状态查询和数据导出。
  当用户提到达人采集、KOL 搜索、网红数据、达人分析、influencer discovery，
  或需要从 TikTok/YouTube/Instagram 获取达人信息时使用此 Skill。
compatibility: Node.js 20.6+
metadata:
  author: creativault
  version: "1.0"
---

# Creativault 达人数据采集

## 前置条件

需要设置以下环境变量：

- `CV_API_KEY` — Creativault Open API Key（从管理后台获取）
- `CV_USER_IDENTITY` — 操作人员邮箱地址
- `CV_API_BASE_URL`（可选）— API 服务地址，默认 `https://dev01-creativault-business.tec-develop.cn`

**Linux / macOS**：

```bash
export CV_API_KEY=cv_live_your_key_here
export CV_USER_IDENTITY=your_email@example.com
```

**Windows PowerShell**：

```powershell
$env:CV_API_KEY = "cv_live_your_key_here"
$env:CV_USER_IDENTITY = "your_email@example.com"
```

## 能力总览

| 能力 | 脚本 | 模式 |
|------|------|------|
| 搜索达人 | `scripts/search_creators.mjs` | 同步，实时返回 |
| 提交采集任务 | `scripts/submit_collection_task.mjs` | 异步，返回 task_id |
| 提交关键词采集 | `scripts/submit_keyword_task.mjs` | 异步，返回 task_id |
| 查询任务状态 | `scripts/get_task_status.mjs` | 同步，单次查询 |
| 轮询任务状态 | `scripts/poll_task_status.mjs` | 自动轮询，每 60s 查一次直到完成 |
| 获取采集数据 | `scripts/get_task_data.mjs` | 同步，支持分页 |
| 获取下载链接 | `scripts/get_download_url.mjs` | 同步 |

所有脚本参数通过命令行 JSON 字符串传入，结果输出 JSON 到 stdout。

## 标准工作流

### 流程一：搜索达人（实时）

直接搜索，立即返回结果列表：

```bash
node {baseDir}/scripts/search_creators.mjs '{"platform":"tiktok","keyword":"beauty","country_code":"US","followers_cnt_gte":10000,"size":20}'
```

### 流程二：批量采集（异步，需轮询）

> **重要**：采集任务是异步的，耗时通常在 5~30 分钟。提交后必须轮询等待完成，不要立即获取数据。

**步骤 1** — 提交采集任务：

```bash
node {baseDir}/scripts/submit_collection_task.mjs '{"task_type":"LINK_BATCH","platform":"tiktok","values":["https://www.tiktok.com/@creator1","https://www.tiktok.com/@creator2"],"task_name":"Q1 达人采集"}'
```

**步骤 2** — 轮询任务状态（自动每 60 秒查询一次，直到完成）：

```bash
node {baseDir}/scripts/poll_task_status.mjs '{"task_id":"task_xxx"}'
```

轮询脚本会持续输出进度到 stderr，任务完成后输出最终结果到 stdout。默认每 60 秒查一次，最多轮询 45 次（约 45 分钟）。可自定义：

```bash
# 每 30 秒查一次，最多查 60 次
node {baseDir}/scripts/poll_task_status.mjs '{"task_id":"task_xxx","interval":30,"max_attempts":60}'
```

如果只需要查一次当前状态（不轮询），用 `get_task_status.mjs`：

```bash
node {baseDir}/scripts/get_task_status.mjs '{"task_id":"task_xxx"}'
```

**步骤 3** — 任务完成后，获取采集数据：

```bash
node {baseDir}/scripts/get_task_data.mjs '{"task_id":"task_xxx","page":1,"size":50}'
```

### 流程三：关键词采集（异步）

提交后用 `poll_task_status.mjs` 轮询等待，完成后获取数据：

```bash
# 步骤 1: 提交
node {baseDir}/scripts/submit_keyword_task.mjs '{"platform":"tiktok","keywords":["beauty tips","skincare routine"]}'

# 步骤 2: 轮询等待完成
node {baseDir}/scripts/poll_task_status.mjs '{"task_id":"task_xxx"}'

# 步骤 3: 获取数据
node {baseDir}/scripts/get_task_data.mjs '{"task_id":"task_xxx"}'
```

## 脚本参数详解

### search_creators.mjs — 搜索达人

`platform` 为必填，其余为可选筛选条件。

**通用参数**：

| 参数 | 类型 | 说明 |
|------|------|------|
| `platform` | string | **必填**。`tiktok` / `youtube` / `instagram` |
| `keyword` | string | 搜索关键词 |
| `country_code` | string | 国家代码，多选逗号分隔（如 `US,CA`）|
| `gender` | string | 性别 |
| `has_email` | boolean | 是否有邮箱 |
| `followers_cnt_gte` | integer | 粉丝数 ≥ |
| `followers_cnt_lte` | integer | 粉丝数 ≤ |
| `page` | integer | 页码，默认 1 |
| `size` | integer | 每页数量，默认 50，最大 100 |
| `sort_field` | string | 排序字段（如 `followers_cnt`）|
| `sort_order` | string | `asc` / `desc`（默认 `desc`）|

各平台特有参数见 [平台参数参考](references/platform-params.md)。

### submit_collection_task.mjs — 提交采集任务

| 参数 | 类型 | 说明 |
|------|------|------|
| `task_type` | string | **必填**。`LINK_BATCH`（链接）/ `FILE_UPLOAD`（用户名）|
| `platform` | string | **必填**。`tiktok` / `youtube` / `instagram` |
| `values` | string[] | **必填**。链接或用户名列表，最多 500 个 |
| `task_name` | string | 任务名称 |
| `webhook_url` | string | 完成回调 URL（HTTPS）|

### submit_keyword_task.mjs — 提交关键词采集

| 参数 | 类型 | 说明 |
|------|------|------|
| `platform` | string | **必填**。`tiktok` / `youtube` / `instagram` |
| `keywords` | string[] | **必填**。关键词列表，最多 10 个 |
| `task_name` | string | 任务名称 |
| `webhook_url` | string | 完成回调 URL（HTTPS）|

### get_task_status.mjs — 查询任务状态（单次）

| 参数 | 类型 | 说明 |
|------|------|------|
| `task_id` | string | **必填**。任务 ID |

返回字段：`status`（processing / completed / failed / timeout）、`progress`（0~100）。

### poll_task_status.mjs — 轮询任务状态（自动定时）

| 参数 | 类型 | 说明 |
|------|------|------|
| `task_id` | string | **必填**。任务 ID |
| `interval` | integer | 轮询间隔秒数，默认 60 |
| `max_attempts` | integer | 最大轮询次数，默认 45（约 45 分钟）|

采集任务耗时通常 5~30 分钟。脚本会每隔 `interval` 秒查询一次任务状态，进度信息输出到 stderr，任务到达终态（completed / failed / timeout）后输出最终结果到 stdout 并退出。

### get_task_data.mjs — 获取采集数据

| 参数 | 类型 | 说明 |
|------|------|------|
| `task_id` | string | **必填**。任务 ID |
| `page` | integer | 页码，默认 1 |
| `size` | integer | 每页数量，默认 20，最大 100 |

### get_download_url.mjs — 获取文件下载链接

| 参数 | 类型 | 说明 |
|------|------|------|
| `file_id` | string | 文件 ID（与 file_name 二选一）|
| `file_name` | string | 文件名（与 file_id 二选一）|

## 常用示例

```bash
# 搜索美国 TikTok 美妆达人，粉丝 1 万以上
node {baseDir}/scripts/search_creators.mjs '{"platform":"tiktok","keyword":"beauty","country_code":"US","followers_cnt_gte":10000,"size":20}'

# 搜索 YouTube 科技频道，订阅 5 万以上
node {baseDir}/scripts/search_creators.mjs '{"platform":"youtube","keyword":"tech review","followers_cnt_gte":50000}'

# 搜索 Instagram 带货达人
node {baseDir}/scripts/search_creators.mjs '{"platform":"instagram","is_product_kol":true,"country_code":"US"}'

# 批量链接采集
node {baseDir}/scripts/submit_collection_task.mjs '{"task_type":"LINK_BATCH","platform":"tiktok","values":["https://www.tiktok.com/@creator1"]}'

# 批量用户名采集
node {baseDir}/scripts/submit_collection_task.mjs '{"task_type":"FILE_UPLOAD","platform":"youtube","values":["creator1","creator2"]}'

# 关键词采集
node {baseDir}/scripts/submit_keyword_task.mjs '{"platform":"tiktok","keywords":["beauty tips"]}'
```

## 错误处理

| 错误码 | HTTP 状态码 | 说明 | 处理建议 |
|--------|-----------|------|---------|
| 40001 | 400 | 参数验证失败 | 检查参数格式和取值范围 |
| 40101 | 401 | API Key 无效 | 检查 CV_API_KEY 环境变量 |
| 40102 | 401 | API Key 已过期 | 联系管理员续期 |
| 40103 | 401 | API Key 已吊销 | 联系管理员 |
| 40104 | 401 | 缺少用户标识 | 检查 CV_USER_IDENTITY 环境变量 |
| 42901 | 429 | 请求频率超限 | 等待 60 秒后重试 |
| 42902 | 402 | 每日配额用尽 | 明日重试或升级套餐 |

## 参考文档

- [完整 API 字段参考](references/api-reference.md) — 各接口请求/响应字段完整说明
- [各平台特有参数](references/platform-params.md) — TikTok/YouTube/Instagram 各自的筛选参数
- [错误码完整列表](references/error-codes.md) — 所有错误码及排查指南
