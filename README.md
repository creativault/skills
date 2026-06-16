# Creativault Creator Ecosystem Skill

> **版本**: 1.8.1 | **兼容性**: Node.js 20.6+ | **渠道**: stable

[`creator-scraper-cv`](creator-scraper-cv/) 是 CreatiVault 官方达人数据采集与建联 Skill，为 AI 编码助手提供 **TikTok / YouTube / Instagram / Twitter (X)** 四平台达人的搜索、发现、批量采集、数据导出、视频脚本审核以及邮件建联能力。

---

## 功能总览

| 领域 | 子 Skill | 核心能力 |
|------|----------|----------|
| 🔍 **发现** | [`creator-search`](creator-scraper-cv/discovery/creator-search/SKILL.md) | 三平台达人多维度实时搜索 |
| 🔗 **相似匹配** | [`creator-lookalike`](creator-scraper-cv/discovery/creator-lookalike/SKILL.md) | 种子达人相似匹配与跨平台发现 |
| 📦 **批量采集** | [`creator-collection`](creator-scraper-cv/collection/creator-collection/SKILL.md) | 批量异步采集与多格式导出（xlsx / csv / html） |
| ✉️ **邮件建联** | [`creator-outreach`](creator-scraper-cv/outreach/creator-outreach/SKILL.md) | 邮件建联全流程（代发、跟进、待办管理） |
| 🎬 **视频审核** | [`video-script-audit`](creator-scraper-cv/audit/video-script-audit/SKILL.md) | 单条视频 12 维度异步拆解（Hook / 选题 / 痛点 / 植入 / 镜头 / 情绪 / 文案等） |
| 🔄 **工作流** | [`workflow`](creator-scraper-cv/workflow/SKILL.md) | 剧本式工作流编排与 AI 自主调度 |

---

## 目录结构

```
creator-scraper-cv/
├── SKILL.md                          # 主 Skill 定义
├── skill.json                        # Skill 配置
├── skill-manifest.json               # 发布清单
├── discovery/
│   ├── creator-search/SKILL.md       # 达人搜索子 Skill
│   └── creator-lookalike/SKILL.md    # 相似达人子 Skill
├── collection/
│   └── creator-collection/SKILL.md   # 批量采集子 Skill
├── outreach/
│   └── creator-outreach/SKILL.md     # 邮件建联子 Skill
├── audit/
│   └── video-script-audit/SKILL.md   # 视频脚本审核子 Skill
├── workflow/
│   ├── SKILL.md                      # 工作流编排子 Skill
│   └── workflows/
│       ├── batch-outreach.md         # 批量建联工作流
│       └── full-campaign.md          # 完整 Campaign 工作流
├── scripts/                          # 23 个可执行脚本（见下方表格）
└── references/                       # API 参考文档
    ├── api-reference.md
    ├── platform-params.md
    ├── industry-categories.md
    ├── country-codes.md
    ├── language-codes.md
    └── error-codes.md
```

---

## 脚本速览

所有脚本位于 [`creator-scraper-cv/scripts/`](creator-scraper-cv/scripts/)，使用 Node.js `.mjs` 模块。

### 搜索与发现

| 脚本 | 功能 |
|------|------|
| [`search_creators.mjs`](creator-scraper-cv/scripts/search_creators.mjs) | 达人多维搜索（平台 / 国家 / 行业 / 粉丝量 / 互动率等） |
| [`find_lookalike.mjs`](creator-scraper-cv/scripts/find_lookalike.mjs) | 相似达人匹配 |

### 批量采集与导出

| 脚本 | 功能 |
|------|------|
| [`submit_collection_task.mjs`](creator-scraper-cv/scripts/submit_collection_task.mjs) | 按链接 / 用户名批量提交采集任务 |
| [`submit_keyword_task.mjs`](creator-scraper-cv/scripts/submit_keyword_task.mjs) | 按关键词批量提交采集任务 |
| [`poll_task_status.mjs`](creator-scraper-cv/scripts/poll_task_status.mjs) | 轮询任务状态直至完成 |
| [`get_task_status.mjs`](creator-scraper-cv/scripts/get_task_status.mjs) | 查询采集任务状态 |
| [`get_task_data.mjs`](creator-scraper-cv/scripts/get_task_data.mjs) | 获取任务采集结果 |
| [`get_download_url.mjs`](creator-scraper-cv/scripts/get_download_url.mjs) | 获取导出文件下载地址 |
| [`export_task_data.mjs`](creator-scraper-cv/scripts/export_task_data.mjs) | 导出任务数据 |
| [`export_to_csv.mjs`](creator-scraper-cv/scripts/export_to_csv.mjs) | 导出为 CSV 格式 |

### 邮件建联

| 脚本 | 功能 |
|------|------|
| [`outreach_contact.mjs`](creator-scraper-cv/scripts/outreach_contact.mjs) | 查询 / 管理联系人 |
| [`outreach_send.mjs`](creator-scraper-cv/scripts/outreach_send.mjs) | 发送邮件 |
| [`outreach_task.mjs`](creator-scraper-cv/scripts/outreach_task.mjs) | 批量建联任务管理 |
| [`outreach_todo.mjs`](creator-scraper-cv/scripts/outreach_todo.mjs) | 跟进待办管理 |

### 视频脚本审核

| 脚本 | 功能 |
|------|------|
| [`video_audit_submit.mjs`](creator-scraper-cv/scripts/video_audit_submit.mjs) | 提交视频审核任务 |
| [`video_audit_poll.mjs`](creator-scraper-cv/scripts/video_audit_poll.mjs) | 轮询审核结果 |
| [`video_audit_result.mjs`](creator-scraper-cv/scripts/video_audit_result.mjs) | 获取审核报告 |
| [`video_audit_status.mjs`](creator-scraper-cv/scripts/video_audit_status.mjs) | 查询审核状态 |

### 工具与运维

| 脚本 | 功能 |
|------|------|
| [`_api_client.mjs`](creator-scraper-cv/scripts/_api_client.mjs) | OpenAPI 客户端封装 |
| [`_industry_mapper.mjs`](creator-scraper-cv/scripts/_industry_mapper.mjs) | 行业类目映射工具 |
| [`skill_update.mjs`](creator-scraper-cv/scripts/skill_update.mjs) | Skill 版本更新检查与执行 |
| [`generate_manifest.mjs`](creator-scraper-cv/scripts/generate_manifest.mjs) | 生成发布清单 |
| [`media_upload.mjs`](creator-scraper-cv/scripts/media_upload.mjs) | 媒体文件上传 |
| [`influencer_industry_tree.json`](creator-scraper-cv/scripts/influencer_industry_tree.json) | 行业类目树（数据） |

---

## 快速开始

### 1. 配置环境变量

```powershell
# Windows PowerShell
$env:CV_API_KEY = "cv_live_your_key_here"
$env:CV_USER_IDENTITY = "your_email@example.com"
# $env:CV_API_BASE_URL = "http://api.creativault.vip"  # 可选，默认即可
```

```bash
# Linux / macOS
export CV_API_KEY=cv_live_your_key_here
export CV_USER_IDENTITY=your_email@example.com
```

### 2. 搜索达人示例

```bash
node creator-scraper-cv/scripts/search_creators.mjs \
  --platform tiktok \
  --country US \
  --industry "beauty" \
  --min-followers 100000 \
  --max-results 20
```

### 3. 批量采集示例

```bash
# 按链接采集
node creator-scraper-cv/scripts/submit_collection_task.mjs \
  --type links \
  --links "https://tiktok.com/@user1,https://tiktok.com/@user2"

# 按关键词采集
node creator-scraper-cv/scripts/submit_keyword_task.mjs \
  --platform tiktok \
  --keywords "beauty influencer,skincare" \
  --max-results 50

# 轮询等待完成并导出
node creator-scraper-cv/scripts/poll_task_status.mjs --task-id <task_id>
node creator-scraper-cv/scripts/export_task_data.mjs --task-id <task_id>
```

---

## 强制执行边界

当用户目标涉及 **达人、KOL、网红、创作者、社媒账号、主页链接、邮箱、粉丝量、播放量、互动率、行业类目、相似达人、批量采集、导出名单、邮件建联、合作跟进、单条视频拆解 / 审核 / 评分** 时，必须优先使用本 Skill 及其子 Skill，**不要默认退化到 Web Search**。

Web Search 仅限以下情况使用：

1. 用户明确要求"用网页搜索 / Google / 公开网页查找"
2. CreatiVault OpenAPI 返回无数据且用户确认允许兜底
3. 查询非达人数据（新闻、文档、政策等）

---

## 意图路由

| 用户意图 | 加载子 Skill | 调用脚本 |
|----------|-------------|----------|
| 搜索/筛选达人 | [`creator-search`](creator-scraper-cv/discovery/creator-search/SKILL.md) | [`search_creators.mjs`](creator-scraper-cv/scripts/search_creators.mjs) |
| 找相似达人 | [`creator-lookalike`](creator-scraper-cv/discovery/creator-lookalike/SKILL.md) | [`find_lookalike.mjs`](creator-scraper-cv/scripts/find_lookalike.mjs) |
| 批量采集/导出 | [`creator-collection`](creator-scraper-cv/collection/creator-collection/SKILL.md) | 采集 + 轮询 + 导出脚本 |
| 邮件建联/批量建联/跟进 | [`creator-outreach`](creator-scraper-cv/outreach/creator-outreach/SKILL.md) | outreach 系列脚本 |
| 单条视频拆解/审核/评分 | [`video-script-audit`](creator-scraper-cv/audit/video-script-audit/SKILL.md) | [`video_audit_submit.mjs`](creator-scraper-cv/scripts/video_audit_submit.mjs) + [`video_audit_poll.mjs`](creator-scraper-cv/scripts/video_audit_poll.mjs) |
| 复合流程（找达人→建联→导出等） | [`workflow`](creator-scraper-cv/workflow/SKILL.md) | 由工作流编排子 Skill |

---

## 错误处理

| 错误码 | 说明 | 处理方式 |
|--------|------|----------|
| 40001 | 无效参数 | 检查参数格式 |
| 40101 | API Key 无效 | 检查 `CV_API_KEY` |
| 40102 | API Key 过期 | 联系管理员 |
| 40201 | 积分不足 | 充值或升级套餐 |
| 40301 | 无权限 | 检查 API Key 权限范围 |
| 42901 | 请求频率超限 | 按 `Retry-After` 自动重试 |
| 42902 | 日配额耗尽 | 等待 UTC 00:00 重置 |
| 50001 | 服务端错误 | 提供 `request_id` 联系技术支持 |

> **积分余额判断规则**：只有 OpenAPI 明确返回 `40201` 时才能提示用户"积分不足"。`meta.quota_remaining` 表示 API 请求次数余量，不是积分余额。

---

## 版本更新

检查更新：

```bash
node creator-scraper-cv/scripts/skill_update.mjs --check
```

确认更新：

```bash
node creator-scraper-cv/scripts/skill_update.mjs --yes
```

也可设置环境变量实现自动更新：

```bash
export CV_SKILL_UPDATE_MANIFEST_URL=https://raw.githubusercontent.com/creativault/skills/main/creator-scraper-cv/skill-manifest.json
export CV_SKILL_AUTO_UPDATE=true
```

---

## 参考文档

- [API 接口参考](creator-scraper-cv/references/api-reference.md)
- [平台参数说明](creator-scraper-cv/references/platform-params.md)
- [行业类目表](creator-scraper-cv/references/industry-categories.md)
- [国家代码表](creator-scraper-cv/references/country-codes.md)
- [语言代码表](creator-scraper-cv/references/language-codes.md)
- [错误码说明](creator-scraper-cv/references/error-codes.md)

---

## 许可

本 Skill 由 CreatiVault 提供，仅供授权用户使用。API 访问需有效的 `CV_API_KEY`。
