# CreatiVault Skills

CreatiVault 官方 AI Agent Skills 仓库，当前对外提供达人营销数据能力。每个一级目录都是一个可独立安装的 Skill。

## Skills 目录

| Skill | 版本 | 主要能力 | 文档 |
|------|------|----------|------|
| `creator-scraper-cv` | 1.9.7 | 达人发现、视频搜索、批量采集、数据导出、邮件建联、假粉检测与内容审核 | [查看说明](creator-scraper-cv/README.md) |

## 安装

安装 `creator-scraper-cv`：

```bash
npx skills add creativault/skills --skill creator-scraper-cv
```

安装前可查看仓库中可发现的 Skills：

```bash
npx skills add creativault/skills --list
```

当前仓库只公开一个 Skill，因此也可以直接运行：

```bash
npx skills add creativault/skills
```

也可以直接告诉支持 GitHub Skill 安装的 Agent：

> 请从 GitHub 仓库 `creativault/skills` 安装 `creator-scraper-cv` Skill。

## 运行要求

- Node.js 20.6 或更高版本
- 有效的 CreatiVault API 凭证
- 可访问 CreatiVault API 的网络环境

通用环境通过 `CV_API_KEY` 配置凭证。不同 Skill 所需的 API scope 请参阅各自 README。Navos 环境可使用平台登录态自动完成认证。

## 仓库结构

```text
skills/
└── creator-scraper-cv/
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
