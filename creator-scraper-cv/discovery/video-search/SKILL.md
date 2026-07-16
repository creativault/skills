---
name: video-search
description: |
  CreatiVault official video search skill. MUST be used when the user wants to find, search,
  filter, or discover short videos from TikTok, YouTube, or Instagram using hashtag, video title,
  views count, interaction rate, publish date, or creator ID.
  Uses CreatiVault OpenAPI through scripts/search_videos.mjs as the authoritative source.
  Supports cross-platform or single-platform video search with multi-dimensional filters.
  Do not use web search as a fallback unless the user explicitly asks for public web search
  or confirms fallback after OpenAPI has no result.
  Use when: video search, short video discovery, TikTok videos, YouTube Shorts, Instagram Reels,
  find videos by hashtag, search videos by views, search by engagement rate, trending videos,
  viral videos, popular content, content discovery, 视频搜索, 短视频搜索, 找视频, 按话题搜视频,
  品牌视频洞察, 竞品视频洞察, 品牌相关视频, 按播放量搜视频, 按互动率搜视频, 热门视频, 爆款视频,
  TikTok 视频搜索, Reels 搜索, Shorts 搜索.
  跨平台视频搜索能力，支持 TikTok、YouTube、Instagram 多维度筛选（Hashtag、标题、播放量、互动率、发布日期等）。
  Use when: 视频搜索, 短视频搜索, 找视频, 按话题搜索, 品牌视频洞察, 竞品视频洞察,
  video search, short video search, brand video insight, competitor video insight,
  search videos by hashtag, search by views, content discovery
compatibility: Node.js 20.6+
metadata:
  layer: discovery
  parent: creator-scraper-cv
---

# Video Search（视频搜索）

## 概述

跨平台（TikTok、YouTube、Instagram）短视频搜索，支持基于 Hashtag、视频标题、播放量、互动率、发布日期等多维度筛选，结果即时返回。不传 `platform` 时可跨平台搜索。

> **与达人搜索的区别**：视频搜索直接返回视频维度的数据（含视频指标 + 发布达人信息），适合“找某个话题下的爆款视频”“按播放量筛选热门视频”等场景。如需搜索达人本人信息，使用 `creator-search` 子 skill。

## 脚本引用

| 脚本 | 相对路径 | 状态 |
|------|----------|------|
| search_videos.mjs | `../../scripts/search_videos.mjs` | 可用 |
| search_brand_video_insights.mjs | `../../scripts/search_brand_video_insights.mjs` | 可用 |

调用格式：

```bash
node {baseDir}/scripts/search_videos.mjs '{"platform":"tiktok","hashtag":["beauty","skincare"],"video_views_cnt_gte":100000,"page":1,"size":10}'
```

品牌视频洞察检索（复用关键词监控的 hashtag 扩展逻辑，只查已有视频库，不自动触发实时采集）：

```bash
node {baseDir}/scripts/search_brand_video_insights.mjs '{"brand_name":"Fenty Beauty","platforms":["tiktok"],"limit":20}'
```

### 品牌视频洞察展示规则

当调用 `search_brand_video_insights.mjs` 时，不要直接把原始 JSON 丢给用户。必须按下面结构展示：

1. 先说明这是“已有视频库检索”，并明确没有自动触发实时采集。
2. 展示 `keyword_expansion.used_hashtags`，让用户知道品牌名被扩展成了哪些检索词。
3. 展示 `summary`：命中视频数、平台分布、热门标签、高频达人。
4. 用视频表格展示 `items`，推荐字段为：`#`、平台、视频标题、匹配词、播放量、点赞、评论、互动率、达人、发布时间、视频链接。
5. 表格下方给 1-3 条业务判断，例如品牌内容集中在哪些场景、哪些标签更热、哪些达人值得继续看。
6. 如果 `items` 为空，只说明已有视频库未命中，不要静默切换普通视频搜索、网页搜索或实时采集；需要继续采集时先询问用户确认。

推荐展示模板：

```md
已在已有视频库中检索 {brand_name} 相关视频，未触发实时采集。

扩展检索词：{used_hashtags}

命中概览：
- 命中视频：{video_count} 条
- 平台分布：{platform_distribution}
- 热门标签：{top_hashtags}
- 高频达人：{top_creators}

| # | 平台 | 视频标题 | 匹配词 | 播放量 | 点赞 | 评论 | 互动率 | 达人 | 发布时间 | 视频 |
|---|---|---|---|---:|---:|---:|---:|---|---|---|
```

## 参数说明

所有参数均为可选（POST JSON Body 发送到后端），无必填参数，不传则返回最近 15 天的全平台热门视频。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `platform` | string | - | 平台：`tiktok` / `youtube` / `instagram`，不传则查所有平台 |
| `hashtag` | array[string] | - | Hashtag 列表（精确匹配，最多 **5 个**，全部满足） |
| `video_title` | string | - | 视频标题关键词（模糊匹配，最长 200 字符） |
| `video_views_cnt_gte` | integer | - | 最小播放量 |
| `video_views_cnt_lte` | integer | - | 最大播放量 |
| `video_interaction_rate_gte` | number | - | 最小互动率（百分比，如 `5.5` 表示 5.5%） |
| `video_interaction_rate_lte` | number | - | 最大互动率（百分比，如 `20` 表示 20%） |
| `video_publish_date_gte` | string | 最近 15 天 | 发布日期起始（`YYYY-MM-DD`） |
| `video_publish_date_lte` | string | 今天 | 发布日期截止（`YYYY-MM-DD`） |
| `union_user_ids` | string | - | 达人 ID 列表（逗号分隔，按达人筛选视频） |
| `page` | integer | `1` | 页码（1-10） |
| `size` | integer | `10` | 每页数量（1-10，固定上限 10） |

### 参数提取规则

1. `platform` 必须转换为小写：`tiktok` / `youtube` / `instagram`。
2. `hashtag` 必须是 JSON 字符串数组，如 `["beauty"]`，不要传单个字符串。
3. 互动率传 **0~100 的百分比数值**：用户说“互动率至少 5%”时传 `5`，不能传 `0.05`。
4. 日期格式统一传 `YYYY-MM-DD`。
5. 后端默认行为：`video_publish_date_gte` 和 `video_publish_date_lte` 都不传时，默认最近 **15 天**。

### 参数传递强制规则（NOT Pass）

- **[NOT]** `service_level` 参数：视频搜索不使用分级计费。
- **[NOT]** `keyword` / `industry` / `gender` / `country_code` 等达人筛选参数：这些属于 `creator-search`。
- **[NOT]** `sort_field` / `sort_order`：视频搜索暂不支持自定义排序。

## 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `platform` | string | 平台：tiktok / youtube / instagram |
| `videoId` | string | 视频唯一标识 |
| `videoTitle` | string | 视频标题 |
| `videoUrl` | string | 视频页面 URL |
| `coverUrl` | string | 视频封面 URL |
| `viewsCount` | string | 播放量（字符串，避免大数精度问题） |
| `likesCount` | string | 点赞数 |
| `commentsCount` | string | 评论数 |
| `sharesCount` | string | 分享数 |
| `interactionRate` | string | 互动率（百分比字符串，如 `"3.25"`） |
| `publishDate` | string | 发布日期 |
| `duration` | string | 视频时长 |
| `hashtags` | array[string] | Hashtag 列表 |
| `creator` | object | 发布达人信息 |
| `creator.uid` | string | 达人唯一标识 |
| `creator.username` | string | 用户名 |
| `creator.nickname` | string | 昵称 |
| `creator.avatar` | string | 头像 URL |

## 示例

### 按 Hashtag 搜索 TikTok 视频

```json
{"platform":"tiktok","hashtag":["beauty"],"page":1,"size":10}
```

### 跨平台搜索高播放量视频

```json
{"video_views_cnt_gte":1000000,"page":1,"size":10}
```

### 按标题关键词 + 互动率筛选

```json
{"platform":"youtube","video_title":"skincare routine","video_interaction_rate_gte":5,"page":1,"size":10}
```

### 按达人 ID 搜索其近期视频

```json
{"union_user_ids":"7480117868423119918,7158794701745964074","page":1,"size":10}
```

## 输出格式

```md
| # | 平台 | 视频标题 | 播放量 | 点赞 | 评论 | 互动率 | 达人 | 发布日期 | 视频链接 |
```

### 格式规则

- 仅展示实际返回的非空字段。
- 表格内链接用 `[查看][linkN]` 引用式，表格下方定义完整 URL。
- 统计信息单独列出：总匹配数、消耗积分、剩余配额、请求 ID。

## 积分消耗

视频搜索按次计费，与搜索结果条数无关。具体积分单价由后端 `@openapi_billing()` 决定（通常为数 credits/次）。

## 错误处理

| Code | 说明 | 处理方式 |
|------|------|----------|
| 40001 | 无效平台参数 | 检查 platform 值（仅限 tiktok/youtube/instagram） |
| 40101 | API Key 无效 | 检查 CV_API_KEY |
| 50001 | 服务端错误 | 重试或联系支持，附带 request_id |
