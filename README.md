# Creativault Agent Skills

[Agent Skills](https://agentskills.io/specification) for creator data collection across TikTok, YouTube, and Instagram.

## Available Skills

| Skill | Description |
|-------|-------------|
| [creator-scraper-cv](./creator-scraper-cv/) | Search and collect creator data from TikTok, YouTube, and Instagram. Supports multi-dimensional search, batch collection by links/usernames/keywords, task status tracking, and data export. |

## Quick Install

```bash
npx skills add creativault/skills
```

This works with 40+ AI coding agents including Cursor, Claude Code, Kiro, GitHub Copilot, Codex, and more.

## Prerequisites

- Node.js 20.6+
- A Creativault API Key

## Setup

Set the following environment variables before using:

```bash
# Linux / macOS
export CV_API_KEY=cv_live_your_key_here
export CV_USER_IDENTITY=your_email@example.com

# Windows PowerShell
$env:CV_API_KEY = "cv_live_your_key_here"
$env:CV_USER_IDENTITY = "your_email@example.com"
```

| Variable | Required | Description |
|----------|----------|-------------|
| `CV_API_KEY` | Yes | Your Creativault Open API Key |
| `CV_USER_IDENTITY` | Yes | Your email address |
| `CV_API_BASE_URL` | No | API base URL (defaults to production) |

## What You Can Do

Once installed, just talk to your AI agent naturally:

```
Search for TikTok beauty creators in the US with 10k+ followers
```

```
Collect data for this creator: https://www.tiktok.com/@khaby.lame
```

```
Find YouTube tech reviewers with 50k+ subscribers
```

```
Search for Instagram product influencers in the US
```

## Capabilities

| Capability | Script | Mode |
|------------|--------|------|
| Search creators | `search_creators.mjs` | Sync, real-time results |
| Submit collection task | `submit_collection_task.mjs` | Async, returns task_id |
| Submit keyword collection | `submit_keyword_task.mjs` | Async, returns task_id |
| Check task status | `get_task_status.mjs` | Sync, single query |
| Poll task status | `poll_task_status.mjs` | Auto-poll every 60s until done |
| Get collection data | `get_task_data.mjs` | Sync, paginated |
| Get download URL | `get_download_url.mjs` | Sync |

## Supported Platforms

| Platform | Search | Link Collection | Username Collection | Keyword Collection |
|----------|--------|----------------|--------------------|--------------------|
| TikTok | ✅ | ✅ | ✅ | ✅ |
| YouTube | ✅ | ✅ | ✅ | ✅ |
| Instagram | ✅ | ✅ | ✅ | ✅ |

## Manual Installation

If you prefer not to use `npx skills`, copy the skill directory to your agent's skills folder:

```bash
# Clone the repo
git clone https://github.com/creativault/skills.git

# Copy to your project (example for Cursor)
cp -r skills/creator-scraper-cv your-project/.agents/skills/

# Or for Claude Code
cp -r skills/creator-scraper-cv your-project/.claude/skills/

# Or for Kiro
cp -r skills/creator-scraper-cv your-project/.kiro/skills/
```

## License

MIT

## Links

- [Agent Skills Specification](https://agentskills.io/specification)
- [Creativault](https://creativault.ai)
