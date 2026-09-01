# App 市场定位综合分析

## 触发条件

用户要求对某个 App 进行全面的市场表现分析，通常表述为：
- "帮我全面分析一下 XX App"
- "XX 这个 App 市场表现怎么样"
- "给我一份 XX 的市场分析报告"

## 前置信息

| 信息 | 必须 | 来源 |
|------|------|------|
| App 名称或 app_id | 是 | 用户输入 |
| 时间范围 | 否 | 默认近 30 天 |
| 关注市场 | 否 | 默认全球 |

## 执行步骤

### Step 1: 确认 App 身份 → [discovery/app-info]

**目标**：确认 App 基础信息，获取 app_id

**动作**：
- 若用户给了名称 → 调用 `query_app_by_name.mjs`
- 若用户给了 ID → 调用 `query_app_by_id.mjs`

**输出**：确认 App 名称、app_id、开发者、类目

**决策点**：若匹配多条结果，展示列表请用户确认再继续

---

### Step 2: 排名趋势分析 → [analysis/app-trend]

**目标**：了解该 App 近期排名走势

**动作**：调用 `query_app_rank_trend.mjs`
- app_name = Step 1 确认的名称
- start_date = 30 天前
- end_date = 昨天
- category_rank_type = 根据 App 类目自动判断（游戏类用"游戏榜"，其他用"总榜"）

**输出**：排名趋势摘要 + 关键拐点标注

---

### Step 3: 跨国家表现 → [analysis/app-trend]

**目标**：了解该 App 在各国的排名表现和收入分布

**动作**：
1. 调用 `query_app_country_rank.mjs`（target_date = 昨天）
2. 调用 `query_app_country_download_revenue.mjs`（app_id = Step 1 获取）

**输出**：上榜国家数、强势/弱势市场、下载与收入的地理集中度

---

### Step 4: 竞品格局 → [analysis/competitive-intel]

**目标**：发现主要竞品

**动作**：调用 `query_app_competitors.mjs`
- app_id = Step 1 获取
- country_code = "all"
- platform = "0"

**输出**：竞品列表 + 竞争位势判断

---

### Step 5: 广告投放洞察 → [analysis/competitive-intel]

**目标**：了解近期投放策略和效果

**动作**：调用 `query_app_ad_insight.mjs`
- app_id = Step 1 获取
- stat_month = 上个月（完整月数据更可靠）

**输出**：投放规模、地区分布、效果指标与环比变化

**容错**：若返回无数据（App 无广告投放记录），标注"该 App 暂无公开广告投放数据"并跳过

---

### Step 6: 综合报告汇总

**目标**：整合 Step 2-5 的分析结果，输出结构化报告

**输出格式**：

```
## {App名称} 市场定位综合分析

### 1. 核心结论
（1-2 句话总结该 App 当前市场位势）

### 2. 排名走势
（Step 2 的趋势摘要）

### 3. 全球市场分布
（Step 3 的跨国分析）

### 4. 竞争格局
（Step 4 的竞品对比）

### 5. 广告投放策略
（Step 5 的投放分析）

### 6. 综合建议
（基于以上数据的行动建议，注意只基于数据事实，不编造）
```
