# Creativault Agent Skills

PowerData 团队的 [Agent Skills](https://agentskills.io/specification) 集合，用于增强 AI 编码助手在特定任务上的表现。

## Skills 列表

| Skill | 说明 |
|-------|------|
| [nextjs-frontend-base](./nextjs-frontend-base/) | 标准化 Next.js 前端项目脚手架，集成 Tailwind CSS v4、shadcn/ui、Inter 字体和功能模块化架构 |
| [feishu-project-cv](./feishu-project-cv/) | Creativault 飞书项目管理 Skill，支持通过 MOQL 查询需求、缺陷、任务，管理工作项状态和字段 |

## 目录结构

```
skills/
├── .claude-plugin/
│   └── marketplace.json      # 插件市场配置
├── README.md
├── nextjs-frontend-base/
│   ├── SKILL.md
│   ├── assets/template/
│   └── references/
└── feishu-project-cv/
    ├── SKILL.md
    ├── mcp.json
    └── references/
```

## 安装方式

本仓库托管在公司 GitLab 私仓，以下是不同 AI 工具的安装方法。

### Claude Code

#### 1. 添加插件市场

```bash
/plugin marketplace add https://git.tec-do.com/powerdata/skills.git
```

#### 2. 浏览并安装插件

```bash
# 交互式浏览
/plugin marketplace browse

# 直接安装前端 Skills
/plugin install frontend-skills@powerdata-skills

# 直接安装飞书项目 Skills
/plugin install feishu-project-skills@powerdata-skills
```

#### 3. 私仓认证

由于是 GitLab 私仓，需要确保 git 凭证已配置。以下任选其一：

**方式 A：使用 Personal Access Token（推荐）**

在 GitLab 中生成 Access Token（需要 `read_repository` 权限），然后配置环境变量：

```bash
# Linux / macOS — 添加到 ~/.bashrc 或 ~/.zshrc
export GITLAB_TOKEN=glpat-xxxxxxxxxxxxxxxxxxxx

# Windows PowerShell — 添加到 $PROFILE
$env:GITLAB_TOKEN = "glpat-xxxxxxxxxxxxxxxxxxxx"
```

**方式 B：使用 git credential helper**

确保你的 git 已经能正常 clone 该仓库即可：

```bash
# 验证凭证是否正常
git clone https://git.tec-do.com/powerdata/skills.git --depth 1
```

### Kiro

在 Kiro 中，Skills 通过 `.kiro/skills/` 目录或 steering 文件加载。将本仓库 clone 到本地后，可以：

1. 将需要的 skill 文件夹软链接或复制到项目的 `.kiro/skills/` 目录
2. 或在 `.kiro/steering/` 中创建 steering 文件引用 skill 内容

### 手动安装（通用）

适用于任何支持 Agent Skills 的工具：

```bash
# 1. Clone 仓库
git clone https://git.tec-do.com/powerdata/skills.git

# 2. 将需要的 skill 目录复制或链接到你的项目中
cp -r skills/nextjs-frontend-base /your-project/.skills/
cp -r skills/feishu-project-cv /your-project/.skills/
```

## 团队自动推荐（可选）

如果希望团队成员打开项目时自动提示安装此市场，可在项目的 `.claude/settings.json` 中添加：

```json
{
  "extraKnownMarketplaces": {
    "powerdata-skills": {
      "source": {
        "source": "url",
        "url": "https://git.tec-do.com/powerdata/skills.git"
      }
    }
  },
  "enabledPlugins": {
    "frontend-skills@powerdata-skills": true,
    "feishu-project-skills@powerdata-skills": true
  }
}
```

## 参考

- [Agent Skills 规范](https://agentskills.io/specification)
- [Claude Code 插件市场文档](https://docs.anthropic.com/en/docs/claude-code/plugins)
