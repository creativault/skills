---
name: rank-analysis
description: 榜单排名分析，支持查询各类型榜单 TopN、排名飙升 App、榜单类目枚举，以及榜单类型列表。
metadata:
  layer: ranking
  parent: app-ranking-insight
---

# 榜单排名分析

## 概述

提供 App 商店榜单的多维度排名查询与分析能力。当用户想了解"某天某类榜单前 N 名是谁"、"哪些 App 排名涨得最快"、"有哪些榜单/类目可以查"时，应加载本子 skill。

## 脚本引用

| 脚本 | 用途 | 路径 |
|------|------|------|
| list_rank_types.mjs | 列出支持的榜单类型和应用类型 | `../../script/list_rank_types.mjs` |
| list_rank_genres.mjs | 列出榜单类目列表 | `../../script/list_rank_genres.mjs` |
| query_rank_top_n.mjs | 查询榜单 TopN 数据 | `../../script/query_rank_top_n.mjs` |
| query_rising_top.mjs | 查询排名上升最快的 App | `../../script/query_rising_top.mjs` |

辅助脚本（按需）：

| 脚本 | 用途 | 路径 |
|------|------|------|
| get_current_date.mjs | 获取服务端当前日期（用于推断默认日期） | `../../script/get_current_date.mjs` |

## 调用方式

> Windows PowerShell 与 Linux/macOS bash 均可使用单引号包裹 JSON，例如 `'{"key":"value"}'`。
> 以下示例以 PowerShell 格式为准。

```bash
# 列出支持的榜单类型
node script/list_rank_types.mjs

# 列出类目（可按应用/游戏过滤）
node script/list_rank_genres.mjs '{"category_type":"游戏"}'

# 查询榜单 TopN
node script/query_rank_top_n.mjs '{"rank_type":"免费榜","app_type":"游戏榜","top_n":20,"target_date":"20260820"}'

# 查询排名飙升 App
node script/query_rising_top.mjs '{"target_date":"20260820","top_n":10,"category_rank_type":"游戏榜"}'
```

## 参数提取规则

### query_rank_top_n.mjs

查询指定榜单类型的 TopN 数据，含新增 App 对比分析。

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| rank_type | string | 是 | 免费榜 | 榜单类型，取值来自 `list_rank_types.mjs` 返回的榜单类型列表。可选值：免费榜 / 付费榜 / 预约榜 / 畅销榜 / 人气蹿升 |
| app_type | string | 是 | 应用榜 | 应用类型，取值来自 `list_rank_types.mjs` 返回的应用类型列表。可选值：应用榜 / 游戏榜 / 家庭榜 |
| top_n | integer | 是 | 10 | 返回数量，常见值为 10、20、50、100。建议：用户未明确说数量时传 10 即可，取多了响应内容容易超长 |
| target_date | string | 是 | — | 目标查询日期，格式 `YYYYmmdd`（如 `20260809`）。用户说相对日期时需换算为具体日期 |

**参数提取逻辑**：
- `rank_type`：从用户意图中识别榜单类型关键词映射；用户未指定时默认"免费榜"
- `app_type`：从用户意图中识别应用/游戏/家庭；用户未指定时默认"应用榜"
- `top_n`：用户说"前20"传 20，说"Top50"传 50；未明说时建议传 10（取多了响应容易超长）
- `target_date`：格式 `YYYYmmdd`；用户说"今天/昨天/上周"时需先调 `get_current_date.mjs` 获取当前日期再换算

**特殊路由**：当 `rank_type="预约榜"` 时，后端会路由到预约榜专用查询，此时 `app_type` 参数会被忽略（预约榜不区分应用/游戏/家庭）。

### query_rising_top.mjs

查询指定日期排名上升最快的 App（只返回 incr > 0 的数据，按涨幅降序）。

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| target_date | string | 是 | — | 目标查询日期，格式 `YYYYmmdd`（如 `20260809`） |
| top_n | integer | 否 | 20 | 返回数量（1~100）。建议：用户未明确说数量时传 10 即可，取多了响应内容容易超长 |
| genre_id | string | 否 | null | 类目 ID，不传则查看所有类目中涨幅最大的 App。可通过 `list_rank_genres.mjs` 获取 ID |
| category_rank_type | string | 否 | 总榜 | 大类榜单类型。可选值：应用榜 / 游戏榜 / 家庭榜 / 总榜 |
| sort_by | string | 否 | genre_ranking_incr | 排序字段。可选值：`genre_ranking_incr`（类目排名变化）/ `category_ranking_incr`（大类排名变化） |

**参数提取逻辑**：
- `target_date`：格式 `YYYYmmdd`，用户说相对日期时需换算
- `genre_id`：用户提到具体类目（如"射击游戏""休闲"），先调 `list_rank_genres.mjs` 查找对应 ID
- `category_rank_type`：用户说"游戏榜飙升"→ "游戏榜"，说"应用榜涨幅"→ "应用榜"，未指定默认"总榜"
- `sort_by`：用户说"大类排名涨幅"时用 `category_ranking_incr`，否则默认 `genre_ranking_incr`

### list_rank_genres.mjs

列出榜单支持的类目列表，可按大类过滤。

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| category_type | string | 否 | null | 大类过滤。可选值：`应用`（返回 category_id=1 的类目）/ `游戏`（返回 category_id=2 的类目）/ `全部` 或不传（返回所有类目） |

## 执行边界

1. **日期处理**：用户未指定日期时，先调 `get_current_date.mjs` 获取服务端当前日期，再根据"今天/昨天/本周"等相对表达计算 `target_date`。注意：榜单数据通常有 1 天延迟，建议默认用"昨天"。
2. **榜单类型不确定**：如用户只说"帮我看看榜单"但未指定类型，先调 `list_rank_types.mjs` 展示可选项，让用户选择，不要默认选择免费榜。
3. **类目查询前置**：如用户指定了细分类目（如"射击游戏"），需先调 `list_rank_genres.mjs` 获取对应 `genre_id`，再传给 `query_rising_top.mjs`。
4. **数据为空处理**：接口可能返回 `available_dates` 字段表示可用日期列表，此时应提示用户换日期查询，不要编造数据。
5. **新增 App 报告**：`query_rank_top_n.mjs` 返回的 `new_apps_report` 是 Markdown 格式的新增 App 分析，应在结果表格后展示。

## 输出展示规范

### TopN 榜单结果

1. 先给一句摘要："YYYY-MM-DD {榜单类型} {应用类型} Top {N} 如下"
2. Markdown 表格展示排名列表，包含：排名、App名称、app_id、开发者、类目、排名变化
3. 如有 `new_apps_report`，单独以引用块展示新增 App 分析

### 飙升排名结果

1. 摘要："YYYY-MM-DD 排名上升最快的 {N} 个 App（{大类}）"
2. 表格包含：排名变化（↑N）、App名称、类目、当前排名、上期排名
3. 如有 `rank_change_report`，附在表格后展示

### 类目/类型列表

简洁列表或表格展示，附使用提示。

## 智能默认值策略

| 用户表达 | 推断 |
|----------|------|
| "免费榜" / "下载榜" | rank_type = "免费榜" |
| "氪金榜" / "收入榜" | rank_type = "畅销榜" |
| "预约榜" / "即将上线" | rank_type = "预约榜" |
| "蹿升" / "飙升" / "涨得快" | 使用 `query_rising_top.mjs` |
| "游戏" / "手游" | app_type = "游戏榜" 或 category_rank_type = "游戏榜" |
| "应用" / "工具" | app_type = "应用榜" |
