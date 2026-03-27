# 达人采集能力 SKU 化调研文档

> 调研目标：参考 Apify、Tavily 等开源 Agent Skills 的封装模式，为 Creativault 达人采集 Open API 设计一套完整的 Skill 封装方案。
>
> 核心决策：初期不接 MCP，采用 scripts 脚本直接调用 API 的模式（参考 Apify `fetch_actor_details.js`），走付费 Skill 模式，通过 `open_api_keys` 表的 `api_key` 做认证和计费。
>
> 调研日期：2026-03-27

---

## 目录

1. [行业参考分析](#一行业参考分析)
2. [Agent Skills 规范要点](#二agent-skills-规范要点)
3. [我们的 API 能力盘点](#三我们的-api-能力盘点)
4. [Skill 封装完整方案](#四skill-封装完整方案)
5. [scripts 脚本详细设计](#五scripts-脚本详细设计)
6. [SKILL.md 内容设计](#六skillmd-内容设计)
7. [认证与计费设计](#七认证与计费设计)
8. [项目仓库变更清单](#八项目仓库变更清单)
9. [实施路线图](#九实施路线图)
10. [风险与注意事项](#十风险与注意事项)

---

## 一、行业参考分析

### 1.1 Apify 的封装模式

**产品定位**：通用 AI 驱动的 Web 爬虫平台，5000+ 公共 Actor。

**Apify Skill 架构**（`apify-ultimate-scraper`）：

```
apify-ultimate-scraper/
├── SKILL.md                          # 主指令：平台列表、调用流程、参数模板
├── reference/
│   ├── scripts/
│   │   ├── fetch_actor_details.js    # 获取 Actor 详情（调 Apify REST API）
│   │   ├── run_actor.js              # 运行 Actor
│   │   └── get_dataset_items.js      # 获取数据集结果
│   └── actors/
│       └── actors_list.md            # 55+ 平台对应的 Actor ID 对照表
└── (无 mcp.json)
```

**关键设计点**：

- 不依赖 MCP Server，Agent 直接通过 `node scripts/xxx.js` 调用
- 每个脚本封装一个 API 调用，输入参数通过命令行传入
- 认证通过环境变量 `APIFY_TOKEN` 传递
- SKILL.md 告诉 Agent 什么场景调哪个脚本、传什么参数
- 脚本输出 JSON 到 stdout，Agent 直接读取结果

**Apify 脚本模式示意**（`fetch_actor_details.js`）：

```javascript
// 从环境变量读取 token
const token = process.env.APIFY_TOKEN;
const actorId = process.argv[2];

const response = await fetch(
  `https://api.apify.com/v2/acts/${actorId}?token=${token}`
);
const data = await response.json();
console.log(JSON.stringify(data, null, 2));
```

**这就是我们要参考的核心模式** — 简单、直接、零依赖。

---

### 1.2 Tavily 的封装模式

**产品定位**：为 LLM 优化的 Web 搜索 API。

**Tavily Skill 架构**（`tavily-search`）：

```
tavily-search/
├── SKILL.md              # 搜索能力说明 + CLI 命令用法
└── scripts/
    └── search.mjs        # 封装 Tavily API 的 Node.js 脚本
```

**Tavily 的双轨模式**：

| 接入方式 | 说明 | 适用场景 |
|---------|------|---------|
| CLI + Scripts | `tvly search "query"` 或 `node scripts/search.mjs` | Agent Skills 模式 |
| MCP Server | `tavily-mcp` npm 包 | MCP 兼容的 IDE |

Tavily 同时提供了 7 个独立 Skill（search/extract/crawl/map/research/cli/best-practices），每个能力一个 Skill，渐进式使用：

```
Search（搜索）→ Extract（提取）→ Map（发现 URL）→ Crawl（批量爬取）→ Research（深度研究）
```

---

### 1.3 两者对比与我们的选择

| 维度 | Apify | Tavily | 我们（Creativault）|
|------|-------|--------|-----------------|
| 底层服务 | Apify 平台 Actor | Tavily REST API | 自研达人采集 Open API |
| Skill 接入方式 | scripts 脚本调 API | CLI + scripts | **scripts 脚本调 API**（参考 Apify）|
| 认证 | `APIFY_TOKEN` 环境变量 | `TAVILY_API_KEY` 环境变量 | `CV_API_KEY` 环境变量 |
| 计费 | pay-per-result | API 调用次数 | API 调用次数 + 每日配额 |
| Skill 粒度 | 单一大 Skill | 多个小 Skill | **初期单一 Skill，后续按需拆分** |
| MCP 支持 | 有（独立提供）| 有（独立提供）| **初期不接，后续可加** |

---

## 二、Agent Skills 规范要点

根据 [agentskills.io/specification](https://agentskills.io/specification) 官方规范：

### 2.1 SKILL.md 格式要求

```yaml
---
name: skill-name          # 必须，最多 64 字符，小写字母+数字+连字符
description: |            # 必须，最多 1024 字符，描述能力和触发场景
  描述内容
license: MIT              # 可选
compatibility: |          # 可选，最多 500 字符，环境要求
  Node.js 20+
metadata:                 # 可选，任意键值对
  author: creativault
  version: "1.0"
allowed-tools: tool1 tool2  # 可选，预批准的工具列表（实验性）
---

# Markdown 正文（指令内容）
```

### 2.2 目录结构规范

```
skill-name/
├── SKILL.md              # 【必须】主指令文件
├── scripts/              # 【可选】可执行脚本，Agent 可直接运行
├── references/           # 【可选】参考文档，Agent 按需加载
└── assets/               # 【可选】静态资源（模板等）
```

### 2.3 渐进式上下文加载（核心设计原则）

| 阶段 | 加载内容 | Token 预算 |
|------|---------|-----------|
| 启动时 | `name` + `description`（frontmatter）| ~100 tokens |
| 激活时 | SKILL.md 完整正文 | < 5000 tokens（推荐）|
| 按需时 | `scripts/`、`references/` 中的文件 | 按需加载 |

**关键原则**：
- SKILL.md 正文控制在 500 行以内
- 详细参考资料放 `references/` 目录
- 文件引用保持一层深度，避免嵌套引用链

---

## 三、我们的 API 能力盘点

基于 `docs/skill-sku.md` 中定义的 Open API 接口：

### 3.1 接口总览

| 接口 | 路径 | 功能 | 优先级 |
|------|------|------|--------|
| 搜索 TikTok 达人 | `POST /openapi/v1/creators/tiktok/search` | 多维度筛选 TikTok 达人 | P0 |
| 搜索 YouTube 达人 | `POST /openapi/v1/creators/youtube/search` | 多维度筛选 YouTube 达人 | P0 |
| 搜索 Instagram 达人 | `POST /openapi/v1/creators/instagram/search` | 多维度筛选 Instagram 达人 | P0 |
| 提交采集任务 | `POST /openapi/v1/collection/tasks/submit` | 链接/用户名批量采集 | P0 |
| 提交关键词采集 | `POST /openapi/v1/collection/tasks/keyword-submit` | 关键词搜索采集 | P1 |
| 查询任务状态 | `POST /openapi/v1/collection/tasks/status` | 查询采集进度 | P0 |
| 获取采集数据 | `POST /openapi/v1/collection/tasks/data` | 分页获取采集结果 | P0 |
| 获取文件下载链接 | `POST /openapi/v1/files/download-url` | 获取文件临时下载 URL | P1 |
| Webhook 验证 | `POST /openapi/v1/webhook/verify` | 验证回调地址连通性 | P2 |

### 3.2 认证机制

```
请求头：
  X-API-Key: cv_live_Y8nil_BsKAbITdqj...    # API Key（从 open_api_keys 表）
  X-User-Identity: user@example.com           # 用户邮箱
  Content-Type: application/json
```

### 3.3 通用响应结构

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "request_id": "req_abc123",
    "page": 1,
    "size": 50,
    "total": 1200,
    "quota_remaining": -1
  }
}
```

### 3.4 支持的平台

| 平台 | 搜索 | 链接采集 | 用户名采集 | 关键词采集 |
|------|------|---------|----------|----------|
| TikTok | ✅ | ✅ | ✅ | ✅ |
| YouTube | ✅ | ✅ | ✅ | ✅ |
| Instagram | ✅ | ✅ | ✅ | ✅ |

---

## 四、Skill 封装完整方案

### 4.1 目录结构

```
creator-scraper-cv/
├── SKILL.md                              # 主指令文件
├── scripts/
│   ├── search_creators.mjs               # 搜索达人（通用，支持三平台）
│   ├── submit_collection_task.mjs        # 提交采集任务（链接/用户名）
│   ├── submit_keyword_task.mjs           # 提交关键词采集任务
│   ├── get_task_status.mjs               # 查询任务状态
│   ├── get_task_data.mjs                 # 获取采集数据
│   └── get_download_url.mjs             # 获取文件下载链接
└── references/
    ├── api-reference.md                  # 完整接口字段对照表
    ├── platform-params.md                # 各平台特有筛选参数说明
    └── error-codes.md                    # 错误码表 + 排查指南
```

### 4.2 架构图

```
┌─────────────────────────────────────────────────────────┐
│                    AI Agent (IDE)                         │
│  Cursor / Claude Code / Kiro / Kimi Code / Copilot       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐                                        │
│  │  SKILL.md     │  Agent 读取指令，决定调用哪个脚本         │
│  │  (激活时加载)  │                                        │
│  └──────┬───────┘                                        │
│         │                                                 │
│         ▼                                                 │
│  ┌──────────────────────────────────────┐                │
│  │  scripts/*.mjs                        │                │
│  │                                        │                │
│  │  Agent 执行: node scripts/xxx.mjs      │                │
│  │  从 stdout 读取 JSON 结果               │                │
│  └──────────────┬───────────────────────┘                │
│                  │                                         │
└──────────────────┼─────────────────────────────────────────┘
                   │ HTTPS POST
                   │ X-API-Key: cv_live_xxx
                   │ X-User-Identity: user@example.com
                   ▼
┌─────────────────────────────────────────────────────────┐
│              Creativault Open API                         │
│              https://{host}/openapi/v1/                   │
│                                                           │
│  /creators/tiktok/search                                  │
│  /creators/youtube/search                                 │
│  /creators/instagram/search                               │
│  /collection/tasks/submit                                 │
│  /collection/tasks/keyword-submit                         │
│  /collection/tasks/status                                 │
│  /collection/tasks/data                                   │
│  /files/download-url                                      │
└─────────────────────────────────────────────────────────┘
```

### 4.3 与 Apify 模式的对照

| 维度 | Apify `apify-ultimate-scraper` | 我们 `creator-scraper-cv` |
|------|-------------------------------|--------------------------|
| 认证环境变量 | `APIFY_TOKEN` | `CV_API_KEY` + `CV_USER_IDENTITY` |
| 脚本语言 | Node.js (.js) | Node.js (.mjs，ESM 模块) |
| 脚本调用方式 | `node scripts/fetch_actor_details.js <actorId>` | `node scripts/search_creators.mjs <platform> [options]` |
| 参数传递 | 命令行参数 | 命令行参数（JSON 字符串）|
| 输出格式 | JSON stdout | JSON stdout |
| 依赖 | 零依赖（内置 fetch）| 零依赖（Node.js 20+ 内置 fetch）|
| 参考文档 | `reference/actors/actors_list.md` | `references/platform-params.md` |

---

## 五、scripts 脚本详细设计

### 5.1 设计原则

1. **零依赖**：只用 Node.js 20+ 内置 API（`fetch`、`process.env`、`process.argv`），不需要 `npm install`
2. **单一职责**：每个脚本对应一个 API 接口
3. **JSON 输入输出**：参数通过命令行 JSON 字符串传入，结果输出到 stdout
4. **统一错误处理**：错误输出到 stderr，退出码非零
5. **环境变量认证**：`CV_API_KEY` 和 `CV_USER_IDENTITY` 从环境变量读取

### 5.2 公共模块：`_api_client.mjs`

所有脚本共享的 API 调用封装（放在 scripts 目录下，以 `_` 开头表示内部模块）：

```javascript
// scripts/_api_client.mjs

const API_BASE = process.env.CV_API_BASE_URL || 'https://api.creativault.ai';
const API_KEY = process.env.CV_API_KEY;
const USER_IDENTITY = process.env.CV_USER_IDENTITY;

if (!API_KEY) {
  console.error('错误: 未设置 CV_API_KEY 环境变量');
  console.error('请设置: export CV_API_KEY=your_api_key_here');
  process.exit(1);
}

if (!USER_IDENTITY) {
  console.error('错误: 未设置 CV_USER_IDENTITY 环境变量');
  console.error('请设置: export CV_USER_IDENTITY=your_email@example.com');
  process.exit(1);
}

export async function callAPI(path, body = {}) {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      'X-User-Identity': USER_IDENTITY,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!data.success) {
    console.error(JSON.stringify({
      error: data.error,
      request_id: data.meta?.request_id,
    }, null, 2));
    process.exit(1);
  }

  return data;
}

export function parseArgs() {
  const raw = process.argv[2];
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    console.error('错误: 参数必须是有效的 JSON 字符串');
    process.exit(1);
  }
}
```

### 5.3 各脚本设计

#### `search_creators.mjs` — 搜索达人

```javascript
// scripts/search_creators.mjs
import { callAPI, parseArgs } from './_api_client.mjs';

const params = parseArgs();
const platform = params.platform;
delete params.platform;

if (!platform || !['tiktok', 'youtube', 'instagram'].includes(platform)) {
  console.error('错误: platform 必须为 tiktok / youtube / instagram');
  process.exit(1);
}

const result = await callAPI(`/openapi/v1/creators/${platform}/search`, params);
console.log(JSON.stringify(result, null, 2));
```

**Agent 调用示例**：

```bash
# 搜索美国 TikTok 美妆达人，粉丝 1 万以上
node {baseDir}/scripts/search_creators.mjs '{"platform":"tiktok","keyword":"beauty","country_code":"US","followers_cnt_gte":10000,"page":1,"size":20}'

# 搜索 YouTube 科技频道
node {baseDir}/scripts/search_creators.mjs '{"platform":"youtube","keyword":"tech review","followers_cnt_gte":50000}'

# 搜索 Instagram 带货达人
node {baseDir}/scripts/search_creators.mjs '{"platform":"instagram","is_product_kol":true,"country_code":"US"}'
```

---

#### `submit_collection_task.mjs` — 提交采集任务

```javascript
// scripts/submit_collection_task.mjs
import { callAPI, parseArgs } from './_api_client.mjs';

const params = parseArgs();

if (!params.task_type || !['LINK_BATCH', 'FILE_UPLOAD'].includes(params.task_type)) {
  console.error('错误: task_type 必须为 LINK_BATCH 或 FILE_UPLOAD');
  process.exit(1);
}
if (!params.platform || !['tiktok', 'youtube', 'instagram'].includes(params.platform)) {
  console.error('错误: platform 必须为 tiktok / youtube / instagram');
  process.exit(1);
}
if (!params.values || !Array.isArray(params.values) || params.values.length === 0) {
  console.error('错误: values 必须为非空数组');
  process.exit(1);
}

const result = await callAPI('/openapi/v1/collection/tasks/submit', params);
console.log(JSON.stringify(result, null, 2));
```

**Agent 调用示例**：

```bash
# 链接采集
node {baseDir}/scripts/submit_collection_task.mjs '{"task_type":"LINK_BATCH","platform":"tiktok","values":["https://www.tiktok.com/@creator1","https://www.tiktok.com/@creator2"],"task_name":"Q1 达人采集"}'

# 用户名采集
node {baseDir}/scripts/submit_collection_task.mjs '{"task_type":"FILE_UPLOAD","platform":"youtube","values":["creator1","creator2"]}'
```

---

#### `submit_keyword_task.mjs` — 提交关键词采集

```javascript
// scripts/submit_keyword_task.mjs
import { callAPI, parseArgs } from './_api_client.mjs';

const params = parseArgs();

if (!params.platform) {
  console.error('错误: 必须指定 platform');
  process.exit(1);
}
if (!params.keywords || !Array.isArray(params.keywords) || params.keywords.length === 0) {
  console.error('错误: keywords 必须为非空数组');
  process.exit(1);
}

const result = await callAPI('/openapi/v1/collection/tasks/keyword-submit', params);
console.log(JSON.stringify(result, null, 2));
```

---

#### `get_task_status.mjs` — 查询任务状态

```javascript
// scripts/get_task_status.mjs
import { callAPI, parseArgs } from './_api_client.mjs';

const params = parseArgs();
if (!params.task_id) {
  console.error('错误: 必须指定 task_id');
  process.exit(1);
}

const result = await callAPI('/openapi/v1/collection/tasks/status', params);
console.log(JSON.stringify(result, null, 2));
```

---

#### `get_task_data.mjs` — 获取采集数据

```javascript
// scripts/get_task_data.mjs
import { callAPI, parseArgs } from './_api_client.mjs';

const params = parseArgs();
if (!params.task_id) {
  console.error('错误: 必须指定 task_id');
  process.exit(1);
}

const result = await callAPI('/openapi/v1/collection/tasks/data', {
  task_id: params.task_id,
  page: params.page || 1,
  size: params.size || 20,
});
console.log(JSON.stringify(result, null, 2));
```

---

#### `get_download_url.mjs` — 获取文件下载链接

```javascript
// scripts/get_download_url.mjs
import { callAPI, parseArgs } from './_api_client.mjs';

const params = parseArgs();
if (!params.file_id && !params.file_name) {
  console.error('错误: 必须指定 file_id 或 file_name');
  process.exit(1);
}

const result = await callAPI('/openapi/v1/files/download-url', params);
console.log(JSON.stringify(result, null, 2));
```

---

## 六、SKILL.md 内容设计

```markdown
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
- `CV_API_BASE_URL`（可选）— API 基础地址，默认 `https://api.creativault.ai`

## 能力概述

| 能力 | 脚本 | 说明 |
|------|------|------|
| 搜索达人 | `search_creators.mjs` | 按平台、关键词、粉丝数、国家等多维度搜索 |
| 提交采集任务 | `submit_collection_task.mjs` | 通过链接或用户名批量采集达人数据 |
| 提交关键词采集 | `submit_keyword_task.mjs` | 通过关键词搜索并采集达人 |
| 查询任务状态 | `get_task_status.mjs` | 查询采集任务进度 |
| 获取采集数据 | `get_task_data.mjs` | 分页获取采集结果 |
| 获取下载链接 | `get_download_url.mjs` | 获取文件临时下载 URL |

## 标准工作流

### 流程一：搜索达人

直接搜索，实时返回结果：

```bash
node {baseDir}/scripts/search_creators.mjs '{"platform":"tiktok","keyword":"beauty","country_code":"US","followers_cnt_gte":10000,"size":20}'
```

### 流程二：批量采集（异步）

1. 提交采集任务：

```bash
node {baseDir}/scripts/submit_collection_task.mjs '{"task_type":"LINK_BATCH","platform":"tiktok","values":["https://www.tiktok.com/@creator1"]}'
```

2. 轮询任务状态（等待 `completed`）：

```bash
node {baseDir}/scripts/get_task_status.mjs '{"task_id":"task_xxx"}'
```

3. 获取采集数据：

```bash
node {baseDir}/scripts/get_task_data.mjs '{"task_id":"task_xxx","page":1,"size":50}'
```

### 流程三：关键词采集（异步）

1. 提交关键词任务 → 2. 轮询状态 → 3. 获取数据（同流程二的步骤 2-3）

```bash
node {baseDir}/scripts/submit_keyword_task.mjs '{"platform":"tiktok","keywords":["beauty tips","skincare"]}'
```

## 脚本参数说明

### search_creators.mjs

所有参数通过 JSON 字符串传入。`platform` 为必填，其余为可选筛选条件。

**通用参数**：

| 参数 | 类型 | 说明 |
|------|------|------|
| `platform` | string | **必填**。`tiktok` / `youtube` / `instagram` |
| `keyword` | string | 搜索关键词 |
| `country_code` | string | 国家代码，多选逗号分隔（如 `US,CA`）|
| `gender` | string | 性别 |
| `followers_cnt_gte` | integer | 粉丝数下限 |
| `followers_cnt_lte` | integer | 粉丝数上限 |
| `page` | integer | 页码，默认 1 |
| `size` | integer | 每页数量，默认 50，最大 100 |
| `sort_field` | string | 排序字段 |
| `sort_order` | string | `asc` / `desc`（默认 `desc`）|

各平台特有参数见 [平台参数参考](references/platform-params.md)。

### submit_collection_task.mjs

| 参数 | 类型 | 说明 |
|------|------|------|
| `task_type` | string | **必填**。`LINK_BATCH`（链接）/ `FILE_UPLOAD`（用户名）|
| `platform` | string | **必填**。`tiktok` / `youtube` / `instagram` |
| `values` | string[] | **必填**。链接或用户名列表，最多 500 个 |
| `task_name` | string | 任务名称 |
| `webhook_url` | string | 完成回调 URL（HTTPS）|

### get_task_status.mjs / get_task_data.mjs

| 参数 | 类型 | 说明 |
|------|------|------|
| `task_id` | string | **必填**。任务 ID |
| `page` | integer | 页码（仅 get_task_data）|
| `size` | integer | 每页数量（仅 get_task_data）|

## 错误处理

| 错误码 | HTTP 状态码 | 说明 | 处理建议 |
|--------|-----------|------|---------|
| 40001 | 400 | 参数验证失败 | 检查参数格式 |
| 40101 | 401 | API Key 无效 | 检查 CV_API_KEY 环境变量 |
| 40102 | 401 | API Key 已过期 | 联系管理员续期 |
| 42901 | 429 | 请求频率超限 | 等待 60 秒后重试 |
| 42902 | 402 | 每日配额用尽 | 明日重试或升级套餐 |

## 参考文档

- [完整 API 字段参考](references/api-reference.md)
- [各平台特有参数](references/platform-params.md)
- [错误码完整列表](references/error-codes.md)
```

---

## 七、认证与计费设计

### 7.1 认证流程

```
用户获取 API Key（管理后台 / 注册流程）
        │
        ▼
设置环境变量
  export CV_API_KEY=cv_live_Y8nil_BsKAbITdqj...
  export CV_USER_IDENTITY=user@example.com
        │
        ▼
安装 Skill（通过 powerdata-cli 或手动复制）
        │
        ▼
Agent 调用脚本时自动读取环境变量，附加到请求头
  X-API-Key: cv_live_Y8nil_BsKAbITdqj...
  X-User-Identity: user@example.com
```

### 7.2 与 Apify 的对照

| 维度 | Apify | 我们 |
|------|-------|------|
| Key 格式 | `apify_api_xxx` | `cv_live_xxx`（前缀 `cv_live_`）|
| Key 存储 | Apify 平台账户 | `open_api_keys` 表 |
| 环境变量名 | `APIFY_TOKEN` | `CV_API_KEY` + `CV_USER_IDENTITY` |
| 计费粒度 | 按 Actor 运行次数 + 计算资源 | 按 API 调用次数 + 每日配额 |
| 速率限制 | 30 req/s | 60 req/min（按租户）|
| 配额重置 | 按月 | 按日（UTC 00:00）|

### 7.3 `open_api_keys` 表字段映射

| 表字段 | 用途 | 对应 Apify |
|--------|------|-----------|
| `api_key` | 认证凭证 | `APIFY_TOKEN` |
| `key_prefix` | Key 前缀（`cv_live_`）| `apify_api_` |
| `tenant_id` | 租户隔离 | Apify 账户 |
| `plan` | 套餐（free/pro/...）| Apify 订阅计划 |
| `rate_limit` | 速率限制（次/分钟）| 30 req/s |
| `daily_quota` | 每日配额 | 月度配额 |
| `scopes` | 权限范围（`["*"]`、`["file:download"]`）| Actor 权限 |
| `expires_at` | 过期时间 | Token 有效期 |

### 7.4 SKILL.md 中的认证引导

在 SKILL.md 的「前置条件」部分，需要清晰告诉 Agent 和用户如何设置认证：

```markdown
## 前置条件

1. 获取 API Key：访问 https://app.creativault.ai/settings/api-keys 创建
2. 设置环境变量：

**Linux / macOS**：
export CV_API_KEY=cv_live_your_key_here
export CV_USER_IDENTITY=your_email@example.com

**Windows PowerShell**：
$env:CV_API_KEY = "cv_live_your_key_here"
$env:CV_USER_IDENTITY = "your_email@example.com"
```

---

## 八、项目仓库变更清单

### 8.1 新增文件

| 文件路径 | 说明 |
|---------|------|
| `creator-scraper-cv/SKILL.md` | 达人采集 Skill 主文件 |
| `creator-scraper-cv/scripts/_api_client.mjs` | 公共 API 调用模块 |
| `creator-scraper-cv/scripts/search_creators.mjs` | 搜索达人脚本 |
| `creator-scraper-cv/scripts/submit_collection_task.mjs` | 提交采集任务脚本 |
| `creator-scraper-cv/scripts/submit_keyword_task.mjs` | 提交关键词采集脚本 |
| `creator-scraper-cv/scripts/get_task_status.mjs` | 查询任务状态脚本 |
| `creator-scraper-cv/scripts/get_task_data.mjs` | 获取采集数据脚本 |
| `creator-scraper-cv/scripts/get_download_url.mjs` | 获取文件下载链接脚本 |
| `creator-scraper-cv/references/api-reference.md` | 完整 API 字段对照表 |
| `creator-scraper-cv/references/platform-params.md` | 各平台特有参数说明 |
| `creator-scraper-cv/references/error-codes.md` | 错误码表 + 排查指南 |

### 8.2 修改文件

| 文件路径 | 变更内容 |
|---------|---------|
| `README.md` | Skills 列表表格新增 `creator-scraper-cv` 行 |
| `.claude-plugin/marketplace.json` | `plugins` 数组新增 `creator-scraper-skills` 条目 |

### 8.3 README.md 新增内容

```markdown
| [creator-scraper-cv](./creator-scraper-cv/) | Creativault 达人数据采集 Skill，支持 TikTok/YouTube/Instagram 达人搜索、批量采集和数据导出 |
```

### 8.4 marketplace.json 新增内容

```json
{
  "name": "creator-scraper-skills",
  "description": "达人数据采集 Skills，支持 TikTok/YouTube/Instagram 多平台达人搜索和批量采集",
  "source": "./",
  "strict": false,
  "skills": [
    "./creator-scraper-cv"
  ]
}
```

---

## 九、实施路线图

### Phase 1：最小可用（1 周）— 龙虾先测

**目标**：跑通 Agent → scripts → API 全链路。

| 任务 | 说明 | 产出 |
|------|------|------|
| 1. 创建目录结构 | `creator-scraper-cv/` + scripts/ + references/ | 目录骨架 |
| 2. 实现 `_api_client.mjs` | 公共 API 调用模块 | 可复用的认证+请求封装 |
| 3. 实现 `search_creators.mjs` | 搜索达人（三平台）| 核心脚本 |
| 4. 实现 `submit_collection_task.mjs` | 提交采集任务 | 核心脚本 |
| 5. 实现 `get_task_status.mjs` + `get_task_data.mjs` | 任务状态+数据获取 | 核心脚本 |
| 6. 编写 SKILL.md | 主指令文件 | Agent 可识别和使用 |
| 7. 内部测试 | 在 Cursor / Claude Code 中安装测试 | 测试报告 |

**验收标准**：
- Agent 能根据用户自然语言请求，自动选择正确的脚本
- 搜索达人能返回正确结果
- 采集任务能提交成功并查询到状态和数据

### Phase 2：完善能力（1-2 周）

| 任务 | 说明 |
|------|------|
| 补全剩余脚本 | `submit_keyword_task.mjs`、`get_download_url.mjs` |
| 完善 references/ | 各平台参数对照表、错误码排查指南 |
| 优化 SKILL.md | 根据测试反馈优化指令、添加更多示例 |
| 更新项目配置 | README.md、marketplace.json |
| 多 IDE 测试 | Cursor、Claude Code、Kiro、Kimi Code |

### Phase 3：产品化（2-3 周）

| 任务 | 说明 |
|------|------|
| 接入 MCP Server（可选）| 为支持 MCP 的 IDE 提供更原生的体验 |
| 完善认证引导 | API Key 申请流程、自助管理页面 |
| 计费监控 | 配额使用统计、告警 |
| 文档和示例 | 完整使用文档、视频教程 |
| 发布到 powerdata-cli | 支持 `npx @creativault/powerdata-cli addskill` 一键安装 |

---

## 十、风险与注意事项

### 10.1 技术风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| Node.js 版本兼容 | 低于 20.6 的版本没有内置 `fetch` | SKILL.md 明确标注 `compatibility: Node.js 20.6+` |
| 脚本执行权限 | 部分 IDE 可能限制脚本执行 | 提供手动 curl 命令作为备选方案 |
| 采集任务耗时 | 异步任务可能需要几分钟到几小时 | SKILL.md 中说明轮询策略，建议 Agent 告知用户等待 |
| Token 消耗 | 大量搜索结果会消耗 Agent 上下文 | 默认 `size=20`，脚本输出精简 JSON |
| 跨平台路径 | Windows 和 macOS/Linux 路径分隔符不同 | 使用 `{baseDir}` 占位符，由 Agent 自动解析 |

### 10.2 产品风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| Skill 指令质量 | Agent 不知道什么时候用、怎么用 | 反复测试优化 SKILL.md；description 写清触发词 |
| 环境变量设置门槛 | 用户不会设置环境变量 | 提供各平台（Windows/macOS/Linux）的设置指南 |
| API Key 泄露 | 安全风险 | 环境变量传递，不在脚本或 SKILL.md 中硬编码 |
| 竞品对比 | Apify 等已有成熟方案 | 差异化：专注达人数据、中文支持、本地化平台 |

### 10.3 关键决策记录

| 决策 | 选择 | 原因 |
|------|------|------|
| 初期不接 MCP | ✅ scripts 模式 | 更简单、零依赖、快速验证 |
| 单一 Skill | ✅ 一个 `creator-scraper-cv` | 初期能力不多，不需要拆分 |
| 零依赖脚本 | ✅ 只用 Node.js 内置 API | 用户不需要 `npm install`，降低使用门槛 |
| JSON 参数传递 | ✅ 命令行 JSON 字符串 | Agent 生成 JSON 比拼接命令行参数更可靠 |
| 双环境变量认证 | ✅ `CV_API_KEY` + `CV_USER_IDENTITY` | 与 API 设计一致，支持多用户审计 |

---

## 附录：后续可扩展方向

1. **MCP Server 接入**：Phase 3 可选，为 MCP 兼容 IDE 提供更原生体验
2. **更多平台**：扩展到抖音、小红书、快手等国内平台
3. **Skill 拆分**：当能力足够多时，拆分为 `creator-search`、`creator-collection`、`creator-analytics` 等独立 Skill
4. **CLI 工具**：参考 Tavily 的 `tvly` CLI，封装 `cv` 命令行工具
5. **SDK 封装**：提供 Python / TypeScript SDK，方便非 Agent 场景使用
