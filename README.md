# CreatiVault Skills

CreatiVault 官方 AI Agent Skills 集合，提供达人营销与 App 市场洞察能力。每个一级目录都是一个可独立安装的 Skill。

## Skills 目录

| Skill | 版本 | 主要能力 | 文档 |
|------|------|----------|------|
| `creator-scraper-cv` | 1.9.7 | 达人发现、视频搜索、批量采集、数据导出、邮件建联、假粉检测与内容审核 | [查看说明](creator-scraper-cv/README.md) |
| `app-ranking-insight` | 1.0.0 | App 信息查询、商店榜单、排名趋势、跨国表现、竞品发现与广告投放洞察 | [查看说明](app-ranking-insight/README.md) |

## 安装

建议始终使用 `--skill` 明确选择需要安装的 Skill：

```bash
npx skills add creativault/skills --skill creator-scraper-cv
npx skills add creativault/skills --skill app-ranking-insight
```

安装前可查看仓库中可发现的 Skills：

```bash
npx skills add creativault/skills --list
```

直接运行以下命令时，交互式终端通常会显示 Skill 选择列表；在 AI Agent 或其他非交互环境中，安装器可能自动安装全部可发现的 Skills，因此自动化场景应使用上面的 `--skill` 参数。

```bash
npx skills add creativault/skills
```

也可以直接告诉支持 GitHub Skill 安装的 Agent：

> 请从 GitHub 仓库 `creativault/skills` 安装 `app-ranking-insight` Skill。

## 运行要求

- Node.js 20.6 或更高版本
- 有效的 CreatiVault API 凭证
- 可访问 CreatiVault API 的网络环境

通用环境通过 `CV_API_KEY` 配置凭证。不同 Skill 所需的 API scope 请参阅各自 README。Navos 环境可使用平台登录态自动完成认证。

## 仓库结构

```text
skills/
├── creator-scraper-cv/
│   ├── SKILL.md
│   └── README.md
└── app-ranking-insight/
    ├── SKILL.md
    └── README.md
```

一级 Skill 目录中的 `SKILL.md` 是安装与发现入口；目录内部的其他 `SKILL.md` 用于能力路由，不需要单独安装。

## 安全说明

- 不要将真实的 `CV_API_KEY` 提交到代码仓库或写入公开日志。
- 建议通过环境变量或运行平台提供的密钥管理功能配置凭证。
- Skill 返回的数据与模型分析结果应结合业务场景复核。

## 许可

本仓库中的 Skills 由 CreatiVault 提供，仅供授权用户使用。API 访问需要有效授权，并受对应账户权限和服务条款约束。
