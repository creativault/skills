---
name: app-info
description: App 基础信息查询，支持按名称模糊搜索和按 ID 精确查询，覆盖 Google Play 和 Apple Store 双平台。
metadata:
  layer: discovery
  parent: app-ranking-insight
---

# App 基础信息查询

## 概述

提供 App 基础信息的检索能力。当用户需要查找某个 App 的详情（开发者、类目、评分、上架平台等），或需要获取 `app_id` 以供后续分析工具使用时，应首先调用本子 skill。

## 脚本引用

| 脚本 | 用途 | 路径 |
|------|------|------|
| query_app_by_name.mjs | 按名称模糊查询 App 信息 | `../../script/query_app_by_name.mjs` |
| query_app_by_id.mjs | 按 ID 精确查询 App 信息 | `../../script/query_app_by_id.mjs` |

## 调用方式

> Windows PowerShell 与 Linux/macOS bash 均可使用单引号包裹 JSON，例如 `'{"key":"value"}'`。
> 以下示例以 PowerShell 格式为准。

```bash
node script/query_app_by_name.mjs '{"app_name":"TikTok"}'
node script/query_app_by_id.mjs '{"app_id":"com.zhiliaoapp.musically"}'
```

## 参数提取规则

1. **名称查询 (`query_app_by_name.mjs`)**
   - `app_name`（必填）：从用户话语中提取 App 名称，保持原始拼写
   - 支持中英文名称、简称、别名（如"抖音国际版" → "TikTok"）
   - 返回 Google Play 和 Apple Store 各最多 5 条匹配结果

2. **ID 查询 (`query_app_by_id.mjs`)**
   - `app_id`（必填）：Google Play 为包名格式（如 `com.xxx.app`），Apple Store 为纯数字 ID
   - 优先查 Google Play，无结果再查 Apple Store

## 执行边界

1. 用户只说了 App 名称但未指定平台 → 两个平台都查，不需要澄清
2. 用户给了包名或数字 ID → 直接用 `query_app_by_id.mjs`
3. 名称查询返回多条结果 → 展示匹配列表让用户确认，不要自动选择第一条
4. 如果后续分析（趋势、竞品、广告）需要 `app_id`，应先通过本子 skill 获取，再传递给下游工具

## 输出展示规范

### 名称查询结果

按平台分组展示，每条结果包含：
- App 名称、app_id、开发者、类目、评分、国家

使用 Markdown 表格展示，表头根据接口实际返回的 `field_meta` 动态适配。

### ID 查询结果

单条详情展示，标注数据来源平台（`google_play` / `apple_store`）。

## 常见前置场景

| 场景 | 动作 |
|------|------|
| 用户说"帮我查一下 XXX 这个 App" | 调用 `query_app_by_name.mjs` |
| 用户给了包名问"这是什么 App" | 调用 `query_app_by_id.mjs` |
| 后续子 skill 需要 app_id 但用户只给了名称 | 先调本 skill 获取 app_id，再流转到目标子 skill |
