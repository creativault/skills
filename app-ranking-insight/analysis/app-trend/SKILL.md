---
name: app-trend
description: App 排名趋势分析与跨国家排名对比，支持纵向时间序列走势和横向多国表现分析，以及各国下载收入分布。
metadata:
  layer: analysis
  parent: app-ranking-insight
---

# App 趋势与跨国对比分析

## 概述

提供单个 App 的纵向排名走势和横向多国表现分析能力。当用户想了解"某 App 最近排名变化趋势"、"某 App 在不同国家表现如何"、"某 App 各国下载和收入分布"时，应加载本子 skill。

## 脚本引用

| 脚本 | 用途 | 路径 |
|------|------|------|
| query_app_rank_trend.mjs | 查询 App 排名趋势（时间序列） | `../../script/query_app_rank_trend.mjs` |
| query_app_country_rank.mjs | 查询 App 跨国家排名 | `../../script/query_app_country_rank.mjs` |
| query_app_country_download_revenue.mjs | 查询 App 各国下载收入分布 | `../../script/query_app_country_download_revenue.mjs` |

前置依赖（按需调用）：

| 脚本 | 用途 | 路径 |
|------|------|------|
| query_app_by_name.mjs | 确认 App 名称与 app_id | `../../script/query_app_by_name.mjs` |
| get_current_date.mjs | 获取当前日期以计算时间范围 | `../../script/get_current_date.mjs` |

## 调用方式

> Windows PowerShell 与 Linux/macOS bash 均可使用单引号包裹 JSON，例如 `'{"key":"value"}'`。
> 以下示例以 PowerShell 格式为准。

```bash
# 查询排名趋势
node script/query_app_rank_trend.mjs '{"app_name":"Roblox","start_date":"20260801","end_date":"20260820","category_rank_type":"游戏榜"}'

# 查询跨国家排名
node script/query_app_country_rank.mjs '{"app_name":"Clash of Clans","target_date":"20260815","category_rank_type":"游戏榜"}'

# 查询各国下载收入分布
node script/query_app_country_download_revenue.mjs '{"app_id":"com.supercell.clashofclans"}'
```

## 参数提取规则

### query_app_rank_trend.mjs

查询指定 App 在一段时间内的排名变化趋势，用于纵向观察排名走势。

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| app_name | string | 是 | — | 目标 App 名称，支持模糊匹配 |
| start_date | string | 是 | — | 起始日期，格式 `YYYYmmdd`（如 `20260801`） |
| end_date | string | 是 | — | 结束日期，格式 `YYYYmmdd`（如 `20260809`） |
| category_rank_type | string | 否 | 总榜 | 大类榜单类型。可选值：应用榜 / 游戏榜 / 家庭榜 / 总榜 |

**参数提取逻辑**：
- `app_name`：从用户话语提取 App 名称，保持原始拼写
- `start_date` / `end_date`：用户说"最近一周"→ end_date 取昨天，start_date 往前推 7 天；"最近一个月"→ 往前推 30 天
- `category_rank_type`：用户说"游戏榜趋势"→ "游戏榜"，未指定默认"总榜"

### query_app_country_rank.mjs

查询指定 App 在各个国家的排名表现，用于发现投放线索和跨区域表现差异。

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| app_name | string | 是 | — | 目标 App 名称，支持模糊匹配 |
| target_date | string | 是 | — | 目标查询日期，格式 `YYYYmmdd` |
| category_rank_type | string | 否 | 总榜 | 大类榜单类型。可选值：应用榜 / 游戏榜 / 家庭榜 / 总榜 |

### query_app_country_download_revenue.mjs

查询某个 App 在不同国家的下载量和收入分布（近 30 天维度）。

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| app_id | string | 是 | — | 目标 App 的 app_id。需为精确 ID，若用户只给了名称需先通过 `query_app_by_name.mjs` 获取 |
| app_id | 是 | 需为精确 ID。若用户只给了名称，先通过 `query_app_by_name.mjs` 获取 |

## 执行边界

1. **App 名称模糊性**：`query_app_rank_trend.mjs` 和 `query_app_country_rank.mjs` 支持模糊匹配，接口内部会做最相似匹配。若返回的 `app_name` 与用户目标不一致，应提醒用户确认。
2. **app_id 前置获取**：`query_app_country_download_revenue.mjs` 要求精确 `app_id`。如用户只提供了名称，必须先调 `query_app_by_name.mjs` 或 `query_app_by_id.mjs` 获取 app_id，不要编造。
3. **时间范围**：
   - 用户说"最近一周" → end_date 取昨天，start_date 往前推 7 天
   - 用户说"最近一个月" → 往前推 30 天
   - 用户说"8 月份" → start_date=20260801, end_date=20260831
   - 时间范围不宜超过 90 天，超过时建议用户缩短
4. **数据空白**：若某些日期无排名数据（App 未上榜），如实说明数据缺失区间，不要补零或编造。

## 输出展示规范

### 排名趋势

1. **摘要**：一句话描述整体走势（上升/下滑/平稳），指出最高点和最低点
2. **趋势表格**：日期 | 排名 | 排名变化 | 所属类目
3. **趋势解读**：结合 `rank_trend_report`（Markdown 格式）展示趋势分析
4. 如走势有明显拐点，主动指出可能的时间节点

### 跨国家排名

1. **摘要**："该 App 在 N 个国家/地区上榜"
2. **表格**：按排名升序展示各国排名，包含国家名、排名、类目排名
3. **洞察**：结合 `country_rank_report` 展示跨区域分析，指出强势市场和弱势市场

### 各国下载收入分布

1. **摘要**：近 30 天总下载量、总收入
2. **表格**：国家 | 下载量 | 下载占比 | 收入 | 收入占比（按下载量降序）
3. **洞察**：指出下载量和收入的地理集中度，是否存在"高下载低收入"或"低下载高收入"的市场

## 智能默认值策略

| 用户表达 | 推断 |
|----------|------|
| "排名趋势" / "走势" / "变化曲线" | 调用 `query_app_rank_trend.mjs` |
| "各国排名" / "哪些国家" / "全球表现" | 调用 `query_app_country_rank.mjs` |
| "下载分布" / "收入分布" / "各国收入" | 调用 `query_app_country_download_revenue.mjs` |
| "最近一周" | start_date = 7天前, end_date = 昨天 |
| "最近一个月" | start_date = 30天前, end_date = 昨天 |
