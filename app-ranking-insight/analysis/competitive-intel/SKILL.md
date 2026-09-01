---
name: competitive-intel
description: 竞品分析与广告投放洞察，支持查询 App 竞品列表和月度广告投放效果分析（含地区/平台分布与环比变化）。
metadata:
  layer: analysis
  parent: app-ranking-insight
---

# 竞品与广告投放洞察

## 概述

提供单个 App 的竞品发现和广告投放效果分析能力。当用户想了解"某 App 的竞品有哪些"、"某 App 广告投了多少钱"、"投放效果如何"时，应加载本子 skill。

## 脚本引用

| 脚本 | 用途 | 路径 |
|------|------|------|
| query_app_competitors.mjs | 查询 App 竞品信息 | `../../script/query_app_competitors.mjs` |
| query_app_ad_insight.mjs | 查询 App 广告投放洞察 | `../../script/query_app_ad_insight.mjs` |

前置依赖（按需调用）：

| 脚本 | 用途 | 路径 |
|------|------|------|
| query_app_by_name.mjs | 获取 app_id（竞品和广告接口均需要精确 ID） | `../../script/query_app_by_name.mjs` |
| query_app_by_id.mjs | 确认 app_id 有效性 | `../../script/query_app_by_id.mjs` |

## 调用方式

> Windows PowerShell 与 Linux/macOS bash 均可使用单引号包裹 JSON，例如 `'{"key":"value"}'`。
> 以下示例以 PowerShell 格式为准。

```bash
# 查询竞品
node script/query_app_competitors.mjs '{"app_id":"com.supercell.clashofclans","country_code":"us","platform":"2"}'

# 查询广告投放洞察
node script/query_app_ad_insight.mjs '{"app_id":"com.supercell.clashofclans","stat_month":"202607"}'
```

## 参数提取规则

### query_app_competitors.mjs

查询某个 App 在特定国家和平台的竞品信息。

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| app_id | string | 是 | — | 目标 App 的 app_id，需为精确 ID。若用户只给名称需先通过 `query_app_by_name.mjs` 获取 |
| country_code | string | 是 | all | 查询目标国家，传入国家缩写字符（如 `us`=美国, `jp`=日本, `ca`=加拿大）。默认传 `all`（全部国家） |
| platform | string | 是 | 0 | 查询目标平台。可选值：`0`=全部 / `1`=iOS / `2`=Android。默认传 `0` |

**参数提取逻辑**：
- `app_id`：精确 ID，用户只给名称时先前置调用 `query_app_by_name.mjs` 获取
- `country_code`：用户说"美国竞品"→ `us`，"日本"→ `jp`，未指定国家则默认传 `all`
- `platform`：用户说"iOS 竞品"→ `1`，"安卓竞品"→ `2`，未指定则默认传 `0`

### query_app_ad_insight.mjs

查询指定 App 某月的广告投放效果分析，含投放规模、地区分布、平台分布及环比变化。

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| app_id | string | 是 | — | 目标 App 的 ID，通常从 `query_app_by_name.mjs` 或 `query_app_by_id.mjs` 等其他查询工具获取 |
| stat_month | string | 是 | — | 统计月份，格式 `YYYYmm`（如 `202608`）。用户说"上个月"/"7月"时需换算为具体月份 |

## 执行边界

1. **app_id 必须精确**：两个脚本均要求 `app_id`，不支持模糊名称。如用户只给了 App 名称，先调 `query_app_by_name.mjs` 获取 app_id 再执行。
2. **竞品查询澄清**：
   - 用户未指定国家 → 默认查全部（all），不需要澄清
   - 用户未指定平台 → 默认查全部（0），不需要澄清
   - 如用户关心特定市场的竞品格局，应引导指定国家代码
3. **广告投放月份**：
   - 用户说"这个月" → 使用当前月份（注意当月数据可能不完整）
   - 用户说"上个月" → 用当前月份减 1
   - 数据通常有半月延迟，如当月数据为空应提示"本月数据可能尚未完成统计"
4. **环比数据解读**：接口返回 `mom_change`（月环比）和 `qoq_change`（季度同比），需在分析中合理使用，但如某字段为 null 表示缺少对比基准，如实说明。

## 输出展示规范

### 竞品信息

1. **摘要**："在 {国家} {平台} 共发现 N 个竞品"
2. **竞品表格**：

| 竞品名称 | 开发者 | 平台 | 国家 | 下载量 | 收入 | 每下载收入(RPD) | 评分 |
|----------|--------|------|------|--------|------|-----------------|------|

3. **竞品洞察**（可选）：指出下载量最大的竞品、收入最高的竞品、RPD 最高的竞品

### 广告投放洞察

1. **核心指标摘要表**：

| 指标 | 当月值 | 环比变化 |
|------|--------|----------|
| 投放记录数 | xxx | +xx% |
| 广告组数 | xxx | +xx% |
| 消耗 | $xxx | +xx% |
| 曝光 | xxx | +xx% |
| 点击 | xxx | +xx% |
| 安装 | xxx | +xx% |
| 收入 | $xxx | +xx% |

2. **地区分布**：按消耗降序展示 Top 投放地区
3. **平台分布**：展示各投放平台占比
4. **归因分析**：基于 `ad_insight_report`（Markdown 格式）和环比数据，给出投放效果判断：
   - 消耗增但安装未增 → 获客成本上升，可能素材疲劳
   - 安装增但收入未增 → 变现效率下降，需关注用户质量
   - 整体正增长 → 投放进入放量期

## 智能默认值策略

| 用户表达 | 推断 |
|----------|------|
| "竞品" / "竞争对手" / "同类产品" | 调用 `query_app_competitors.mjs` |
| "广告" / "投放" / "买量" / "获客" | 调用 `query_app_ad_insight.mjs` |
| "美国竞品" / "US 市场竞品" | country_code = "us" |
| "iOS 竞品" | platform = "1" |
| "安卓竞品" | platform = "2" |
| "上个月投放" | stat_month = 上月 YYYYmm |
| "7 月广告效果" | stat_month = "202607"（结合当前年份） |
