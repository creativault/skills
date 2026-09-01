# CreatiVault App Ranking Insight

> **当前版本**：1.0.0 · **运行环境**：Node.js 20.6+ · **发布渠道**：stable

`app-ranking-insight` 是 CreatiVault 官方 App 市场数据洞察 Skill，可帮助 AI Agent 查询应用商店榜单、分析排名变化和跨国表现，并完成竞品与广告投放洞察。

## 主要能力

| 能力 | 说明 |
|------|------|
| App 信息查询 | 按名称模糊搜索，或按 App ID 精确查询 |
| 榜单分析 | 查询免费榜、畅销榜、预约榜、类目榜和 Top N 应用 |
| 飙升分析 | 识别指定日期和类目中的排名快速上升应用 |
| 排名趋势 | 分析指定时间范围内的排名时间序列 |
| 跨国表现 | 对比 App 在不同国家或地区的榜单排名 |
| 下载与收入 | 查看各国家或地区的下载量、收入及其分布 |
| 竞品发现 | 查询指定 App 的主要竞争应用 |
| 广告洞察 | 分析月度广告投放表现及环比变化 |
| 综合工作流 | 生成市场定位分析或竞品对标报告 |

## 安装

从 CreatiVault Skills 仓库安装：

```bash
npx skills add creativault/skills --skill app-ranking-insight
```

也可以告诉支持 GitHub Skill 安装的 Agent：

> 请从 GitHub 仓库 `creativault/skills` 安装 `app-ranking-insight` Skill。

## 使用方式

安装后直接用自然语言描述需求，例如：

- 查询 TikTok 的 App 基础信息。
- 查看美国游戏免费榜前 20 名。
- 分析 Roblox 最近 30 天的榜单排名趋势。
- 对比 Clash of Clans 在不同国家的排名表现。
- 找出某款 App 的主要竞品并分析近期广告投放。
- 生成某款 App 的市场定位综合报告。

Skill 会根据意图自动路由到信息查询、榜单分析、趋势分析、竞争情报或综合工作流。

## 认证配置

### 通用环境

通过环境变量配置 CreatiVault API Key：

```bash
# Linux / macOS
export CV_API_KEY="your-api-key"

# Windows PowerShell
$env:CV_API_KEY = "your-api-key"
```

API Key 需要具备 `app-ranking.*` scope。如需连接测试环境，可额外设置 `CV_OPENAPI_BASE_URL`；未设置时使用生产网关。

### Navos 环境

`navos-cn` 和 `navos-global` profile 会读取 Navos 登录态并自动完成认证，通常不需要手工设置 `CV_API_KEY`。

## 直接调用脚本

通常应由 AI Agent 按照 [`SKILL.md`](SKILL.md) 调用脚本。如需调试，可在本 Skill 目录中直接运行：

```powershell
node script/query_app_by_name.mjs '{"app_name":"TikTok"}'
node script/query_rank_top_n.mjs '{"rank_type":"免费榜","app_type":"游戏榜","top_n":20,"target_date":"20260820"}'
node script/query_app_rank_trend.mjs '{"app_name":"Roblox","start_date":"20260801","end_date":"20260820","category_rank_type":"游戏榜"}'
```

日期格式：榜单和趋势使用 `YYYYmmdd`，广告投放月份使用 `YYYYmm`。榜单数据通常有一天延迟，查询最新榜单时建议使用昨天的日期。

## 目录结构

```text
app-ranking-insight/
├── SKILL.md                 # Skill 入口与意图路由
├── skill.json               # 版本与运行配置
├── discovery/               # App 信息查询
├── ranking/                 # 榜单与飙升分析
├── analysis/                # 趋势、跨国表现与竞争情报
├── workflow/                # 市场定位与竞品对标工作流
├── script/                  # Node.js 执行脚本
├── profiles/                # common 与 Navos 环境配置
└── references/              # 国家与地区代码参考
```

## 安全说明

- 不要将真实的 `CV_API_KEY` 提交到代码仓库或写入公开日志。
- 建议通过环境变量或运行平台提供的密钥管理功能配置凭证。
- 分析结论应以接口返回数据为依据；数据未覆盖的维度不应推测补全。

## 许可

本 Skill 由 CreatiVault 提供，仅供授权用户使用。API 访问需要有效授权，并受对应账户权限和服务条款约束。
