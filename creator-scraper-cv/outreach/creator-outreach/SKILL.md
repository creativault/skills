---
name: creator-outreach
description: |
  Creator outreach skill. MUST be used when the user wants to send,
  reply, batch send, batch outreach, follow up, check conversation history, manage todos,
  or contact creators/KOLs/influencers by email. Emails are sent by the platform
  through OpenAPI; never ask the user for SMTP or replace outreach with manual email/web search.
  Use when: email outreach, creator outreach, influencer outreach, send email to creator,
  batch email, batch outreach, reply to creators, follow-up, conversation history, outreach todo,
  campaign outreach, contact influencers, 邮件建联, 建联, 达人建联, 批量建联, 批量发邮件,
  回复达人, 合作邀约, 跟进达人, 沟通历史, 待办跟进, 发合作邮件.
  邮件建联全流程能力，覆盖发送、任务查询、沟通历史、待办跟进、效果指标、渠道配置、附件上传。由该平台统一代发，无需用户提供任何邮箱或 SMTP 配置。
  Use when: 建联, 发邮件, 批量发送, email outreach, send email, outreach
compatibility: Node.js 20.6+
metadata:
  layer: outreach
  parent: creator-scraper-cv
---

# Creator Outreach — 邮件建联

## 概述

邮件建联全流程能力：搜索达人后一键发送邮件，支持单发/批量发送、任务轮询、沟通历史查询、待办跟进、效果指标分析，由该平台统一代发无需用户配置。

## 脚本引用

| 脚本路径 | 状态 | 说明 |
|----------|------|------|
| `../../scripts/outreach_send.mjs` | ✅ 已实现 | 发送邮件（单发/批量） |
| `../../scripts/outreach_task.mjs` | ✅ 已实现 | 查询发送任务状态与结果 |
| `../../scripts/outreach_contact.mjs` | ✅ 已实现 | 查询联系人沟通历史 |
| `../../scripts/outreach_todo.mjs` | ✅ 已实现 | 待办跟进（超时/未读） |
| `../../scripts/outreach_metrics.mjs` | 🔮 待实现 | 效果指标（发送量/打开率/回复率） |
| `../../scripts/outreach_config.mjs` | 🔮 待实现 | 渠道与模板配置查询 |
| `../../scripts/outreach_upload.mjs` | 🔮 待实现 | 附件上传（max 10MB） |

> 🔮 标注的脚本尚未部署，调用将返回错误。待后端实现后可直接启用。

## 架构原则

**Skill = 纯 HTTP 客户端，不做任何本地业务逻辑处理。**

- 脚本只负责组装 JSON 参数并调用 OpenAPI 接口
- 所有业务逻辑（创建提报、查找会话、判断新建/回复）由 OpenAPI 内部完成
- Skill 不需要知道 `submission_id`、`influencer_id` 等内部概念
- 搜索后发送时，将搜索结果中的 `uid` + `platform` 传给 outreach_send，OpenAPI 内部自动从 Holo 查完整达人数据

## 发送机制

**邮件由该平台统一代发，用户无需提供任何发信配置。**

- **[禁止]** 向用户索要 SMTP 配置、邮箱密码、授权码、发信服务器地址
- **[禁止]** 建议用户"用自己的邮箱手动发送"——该平台已具备发送能力
- **[禁止]** 在与用户的任何交流中透露底层邮件服务技术细节（如具体使用的邮件服务商、AWS、SES 等），也不要使用"CreatiVault"等用户可能不熟悉的专有名词——统一用"该平台"指代。用户问"邮件怎么发出去的"→ 回答："由该平台统一代发，无需配置任何邮箱或 SMTP。"
- `channel` 参数对外统一用 `saas`（该平台代发通道，默认值）。脚本内部会自动映射到后端识别的渠道；用户和 AI 都不应传递 `ses` 等内部技术参数。`gmail`/`outlook` 为预留字段，后端未实现。

## 参数说明

### outreach_send.mjs

`to` 和 `recipients` 互斥，传其一。

| 参数 | 类型 | 说明 |
|------|------|------|
| `to` | string | 收件人邮箱（单发） |
| `uid` | string | 达人平台 UID（单发必填，来自搜索结果的 uid 字段） |
| `nickname` | string | 达人昵称（可选，用于会话展示） |
| `platform` | string | 达人平台：tiktok/youtube/instagram |
| `recipients` | object[] | 批量发送：`{email, uid, nickname, platform}` 数组 |
| `subject` | string | 邮件主题 |
| `body_html` | string | HTML 正文（支持 `{{creator_name}}` 变量） |
| `body_text` | string | 纯文本正文 |
| `channel` | string | `saas`（默认，该平台代发通道）。脚本内部自动映射，无需手动指定 |
| `template_id` | integer | 模板 ID（覆盖 subject/body） |
| `send_mode` | string | `immediate`（默认）/ `smart`（时区优化） |
| `force_new` | boolean | 强制新建会话（默认 false） |
| `attachment_ids` | string[] | 附件 ID 列表 |

### outreach_task.mjs

| 参数 | 类型 | 说明 |
|------|------|------|
| `task_id` | string | **必填**。发送返回的任务 ID |
| `include_result` | boolean | 附带逐收件人结果（默认 false） |
| `result_filter` | string | 结果过滤：`all`/`sent`/`failed` |
| `poll` | boolean | 自动轮询至终态（默认 false） |
| `poll_interval` | integer | 轮询间隔秒数（默认 5） |
| `poll_max_attempts` | integer | 最大轮询次数（默认 60） |

### outreach_contact.mjs

| 参数 | 类型 | 说明 |
|------|------|------|
| `email` | string | **必填**。达人邮箱 |
| `include_history` | boolean | 包含消息历史（默认 true） |
| `include_summary` | boolean | 包含 AI 摘要（默认 true） |

### outreach_todo.mjs

| 参数 | 类型 | 说明 |
|------|------|------|
| `overdue_hours` | integer | 超时阈值小时数（默认 24） |
| `include_unread` | boolean | 包含未读会话（默认 true） |
| `include_overdue` | boolean | 包含超时会话（默认 true） |

## 产品信息收集（建议提供，不强制）

**起草邮件正文前，建议先了解用户的产品基本信息**，这能让邮件内容更具体、更有针对性（避免出现"our cup / drinkware products"这种过于笼统的表述）。

但**不强制要求用户提供全部字段**——用户可以只给产品名称就发邮件，也可以补充更多细节。AI 应主动给出参考模板，用户按需提供即可。

### 产品信息参考模板

以下字段作为参考，用户按需提供（有则用，没有不追问）：

| 字段 | 说明 | 示例 |
|------|------|------|
| 具体产品名称 | 产品/品牌的准确名称 | "SnowPeak 钛金属双层保温杯" |
| 产品卖点 | 区别于竞品的核心卖点（1-3 个） | "48h 保温、钛金属轻量、户外便携" |
| 价格区间 | 零售价区间（便于匹配达人调性） | "$30-50" |
| 是否 TikTok Shop 在售 | 是否有 TikTok 小店可挂车 | "是，TikTok Shop US 在售" |
| 是否可寄样 | 能否寄送样品给达人 | "可以寄样" |
| 佣金比例 | 联盟佣金比例 | "15%" |
| 是否需要挂车 | 是否要求达人挂购物车 | "需要挂车" |
| 内容要求 | 对达人内容形式的期望 | "开箱测评 + 使用场景展示，30s 以上" |

### 引导方式

1. 用户首次提出建联需求时，**简要提示**上述参考模板（如"为提升邮件针对性，建议提供产品名称、卖点、是否寄样等信息，按需提供即可"），不要逐条追问
2. 用户提供的部分信息，AI 结构化整理后复用，后续建联无需重复询问
3. 若用户只给了产品名称就要发邮件，直接基于名称起草，不强求补充其他字段
4. 若用户主动提供更多信息，及时更新到产品信息中

## 安全规则

**邮件发送是高风险操作，每次发送前必须获得用户明确确认。**

**[禁止]** 用户说"帮我发邮件"后直接执行发送脚本。

**[必须]** 在执行 `outreach_send.mjs` 之前，展示以下信息并等待用户确认：
1. **产品信息摘要**（如果用户提供了产品信息，展示供确认；未提供则跳过此项）
2. **收件人列表**（单笔展示邮箱；批量≤5 全展示，>5 展示前 5 + "...及其他 N 个"）
3. **邮件主题与正文预览**（正文前 100 字符）
4. 用户说"确认"/"发送"/"是"/"Y" → 执行发送
5. 用户说"取消"/"不发"/"修改" → 不执行，询问修改意见
6. 回复已有会话也需要确认
7. 唯一例外：用户明确说"直接发送不用确认"时可跳过

## 输出格式

### 发送确认格式

```
📧 发送确认

📦 产品信息：
  • 产品：{产品名称}
  • 卖点：{核心卖点}
  • 寄样：{是/否} | 挂车：{是/否} | 佣金：{比例}

👤 收件人：{email 或 N 个收件人列表}
📝 主题：{subject}
📨 正文预览：{前 100 字符...}

确认发送吗？(Y/N)
```

### 任务状态格式

```
📬 发送结果

• 任务ID：{task_id}
• 状态：{completed/partial/failed}
• 成功：{sent_count} 封
• 失败：{failed_count} 封
• 耗时：{duration}
• 消耗积分：{credits_consumed}
```

### 积分说明

| 操作 | 积分消耗 |
|------|----------|
| 发送邮件（每封） | 1 |
| 所有查询接口 | 0（免费） |

### 决策规则

- "发邮件"/"建联"/"reach out" → `outreach_send.mjs`
- 搜索结果列表 → `outreach_send.mjs` + `recipients`
- 发送后 → `outreach_task.mjs` + `poll:true` 确认投递
- "待办"/"follow-up" → `outreach_todo.mjs`
- "沟通历史"/"what did I discuss" → `outreach_contact.mjs`
- "效果"/"metrics" → `outreach_metrics.mjs`（🔮 待实现）
- "渠道"/"模板" → `outreach_config.mjs`（🔮 待实现）
- 模板变量：`{{creator_name}}`、`{{creator_email}}`、`{{platform}}`
- 搜索后发送时，**必须**传 `uid` + `platform`（OpenAPI 自动从 Holo 查完整达人数据）
