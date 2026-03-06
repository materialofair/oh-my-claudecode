English | [한국어](README.ko.md) | [中文](README.zh.md) | [日本語](README.ja.md) | [Español](README.es.md) | [Tiếng Việt](README.vi.md) | [Português](README.pt.md)

# oh-my-claudecode

[![npm version](https://img.shields.io/npm/v/claudecode-omc?color=cb3837)](https://www.npmjs.com/package/claudecode-omc)
[![npm downloads](https://img.shields.io/npm/dm/claudecode-omc?color=blue)](https://www.npmjs.com/package/claudecode-omc)
[![GitHub stars](https://img.shields.io/github/stars/Yeachan-Heo/oh-my-claudecode?style=flat&color=yellow)](https://github.com/Yeachan-Heo/oh-my-claudecode/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4%EF%B8%8F-red?style=flat&logo=github)](https://github.com/sponsors/Yeachan-Heo)

Multi-agent orchestration for Claude Code with zero-friction setup.

[Quick Start](#quick-start) • [Reference](docs/REFERENCE.md) • [Architecture](docs/ARCHITECTURE.md) • [Migration](docs/MIGRATION.md)

_Don't learn Claude Code. Just use OMC._

## What Changed

This project is branded as **oh-my-claudecode**, and the npm package is published as **`claudecode-omc`**.

- Legacy plugin-marketplace install flow is no longer the primary path in this README.
- Use npm package installation and OMC CLI setup commands.
- Multiple executable entrypoints are provided from the same package.

---

## Quick Start

**Step 1: Install**

```bash
npm install -g claudecode-omc
```

**Step 2: Setup**

```bash
omc install
omc setup
```

**Step 3: Build something**

```
autopilot: build a REST API for managing tasks
```

---

## Package and CLI Entrypoints

`claudecode-omc` exposes multiple command names:

- `omc` (primary)
- `oh-my-claudecode` (alias)
- `omc-cli` (alias)
- `omc-analytics` (analytics-focused entry)

Check installed version:

```bash
omc version
```

---

## Update

```bash
npm install -g claudecode-omc@latest
omc setup
```

If needed, run diagnostics:

```bash
omc doctor
```

---

### Not Sure Where to Start?

If you're uncertain about requirements, have a vague idea, or want to micromanage the design:

```
/deep-interview "I want to build a task management app"
```

The deep interview uses Socratic questioning to clarify your thinking before any code is written. It exposes hidden assumptions and measures clarity across weighted dimensions, ensuring you know exactly what to build before execution begins.

## Team Mode (Recommended)

Starting in **v4.1.7**, **Team** is the canonical orchestration surface in OMC. The legacy `swarm` keyword/skill has been removed; use `team` directly.

```text
team 3:executor "fix all TypeScript errors"
```

Pipeline:

`team-plan -> team-prd -> team-exec -> team-verify -> team-fix (loop)`

To enable Claude Code native teams, add this to `~/.claude/settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

---

## Core Features

**v4.4.0 removes the Codex/Gemini MCP servers** (`x`, `g` providers). Use the CLI-first Team runtime (`omc team ...`) to spawn real tmux worker panes:

```bash
omc team 2:codex "review auth module for security issues"
omc team 2:gemini "redesign UI components for accessibility"
omc team 1:claude "implement the payment flow"
omc team status auth-review
omc team shutdown auth-review
```

`/omc-teams` remains as a legacy compatibility skill and now routes to `omc team ...`.

For mixed Codex + Gemini work in one command, use the **`/ccg`** skill (routes via `ask-codex` + `ask-gemini`, then Claude synthesizes):

```bash
/ccg Review this PR — architecture (Codex) and UI components (Gemini)
```

| Surface                   | Workers            | Best For                                     |
| ------------------------- | ------------------ | -------------------------------------------- |
| `omc team N:codex "..."`  | N Codex CLI panes  | Code review, security analysis, architecture |
| `omc team N:gemini "..."` | N Gemini CLI panes | UI/UX design, docs, large-context tasks      |
| `omc team N:claude "..."` | N Claude CLI panes | General tasks via Claude CLI in tmux         |
| `/ccg`                    | ask-codex + ask-gemini | Tri-model advisor synthesis             |

Workers spawn on-demand and die when their task completes — no idle resource usage. Requires `codex` / `gemini` CLIs installed and an active tmux session.

> **Note: Package naming** — The project is branded as **oh-my-claudecode** (repo, plugin, commands), but the npm package is published as [`oh-my-claude-sisyphus`](https://www.npmjs.com/package/oh-my-claude-sisyphus). If you install the CLI tools via npm/bun, use `npm install -g oh-my-claude-sisyphus`.

### Updating

```bash
# 1. Update the marketplace clone
/plugin marketplace update omc

# 2. Re-run setup to refresh configuration
/omc-setup
```

> **Note:** If marketplace auto-update is not enabled, you must manually run `/plugin marketplace update omc` to sync the latest version before running setup.

If you experience issues after updating, clear the old plugin cache:

```bash
/omc-doctor
```

<h1 align="center">Your Claude Just Have been Steroided.</h1>

<p align="center">
  <img src="assets/omc-character.jpg" alt="oh-my-claudecode" width="400" />
</p>

---

## Why oh-my-claudecode?

- **Zero configuration required** - Works out of the box with intelligent defaults
- **Team-first orchestration** - Team is the canonical multi-agent surface
- **Natural language interface** - No commands to memorize, just describe what you want
- **Automatic parallelization** - Complex tasks distributed across specialized agents
- **Persistent execution** - Won't give up until the job is verified complete
- **Cost optimization** - Smart model routing saves 30-50% on tokens
- **Learn from experience** - Automatically extracts and reuses problem-solving patterns
- **Real-time visibility** - HUD statusline shows what's happening under the hood

---

## Features

### Orchestration Modes

Multiple strategies for different use cases — from Team-backed orchestration to token-efficient refactoring. [Learn more →](https://yeachan-heo.github.io/oh-my-claudecode-website/docs.html#execution-modes)

| Mode                    | What it is                                                                              | Use For                                                |
| ----------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| **Team (recommended)**  | Canonical staged pipeline (`team-plan → team-prd → team-exec → team-verify → team-fix`) | Coordinated Claude agents on a shared task list        |
| **omc team (CLI)**      | tmux CLI workers — real `claude`/`codex`/`gemini` processes in split-panes              | Codex/Gemini CLI tasks; on-demand spawn, die when done |
| **ccg**                 | Tri-model advisors via ask-codex + ask-gemini, Claude synthesizes                         | Mixed backend+UI work needing both Codex and Gemini    |
| **Autopilot**           | Autonomous execution (single lead agent)                                                | End-to-end feature work with minimal ceremony          |
| **Ultrawork**           | Maximum parallelism (non-team)                                                          | Burst parallel fixes/refactors where Team isn't needed |
| **Ralph**               | Persistent mode with verify/fix loops                                                   | Tasks that must complete fully (no silent partials)    |
| **Pipeline**            | Sequential, staged processing                                                           | Multi-step transformations with strict ordering        |
| **Ultrapilot (legacy)** | Deprecated compatibility mode (autopilot pipeline alias)                                | Existing workflows and older docs                      |

### Intelligent Orchestration

- **32 specialized agents** for architecture, research, design, testing, data science
- **Smart model routing** - Haiku for simple tasks, Opus for complex reasoning
- **Automatic delegation** - Right agent for the job, every time

### Developer Experience

- **Magic keywords** - `ralph`, `ulw`, `team` for explicit control
- **HUD statusline** - Real-time orchestration metrics in your status bar
- **Skill learning** - Extract reusable patterns from your sessions
- **Analytics & cost tracking** - Understand token usage across all sessions

[Full feature list →](docs/REFERENCE.md)

---

## Magic Keywords

Optional shortcuts for power users. Natural language works fine without them.

| Keyword                | Effect                                 | Example                                        |
| ---------------------- | -------------------------------------- | ---------------------------------------------- |
| `team`                 | Canonical Team orchestration           | `/team 3:executor "fix all TypeScript errors"` |
| `omc team`             | tmux CLI workers (codex/gemini/claude) | `omc team 2:codex "security review"`           |
| `ccg`                  | ask-codex + ask-gemini synthesis       | `/ccg review this PR`                          |
| `autopilot`            | Full autonomous execution              | `autopilot: build a todo app`                  |
| `ralph`                | Persistence mode                       | `ralph: refactor auth`                         |
| `ulw`                  | Maximum parallelism                    | `ulw fix all errors`                           |
| `ralplan`              | Iterative planning consensus           | `ralplan this feature`                         |
| `deep-interview`       | Socratic requirements clarification    | `deep-interview "vague idea"`                  |
| `deepsearch`           | Codebase-focused search routing        | `deepsearch for auth middleware`               |
| `ultrathink`           | Deep reasoning mode                    | `ultrathink about this architecture`           |
| `cancelomc`, `stopomc` | Stop active OMC modes                  | `stopomc`                                      |

**Notes:**

- **ralph includes ultrawork**: when you activate ralph mode, it automatically includes ultrawork's parallel execution.
- `swarm` compatibility alias has been removed; migrate existing prompts to `/team` syntax.
- `plan this` / `plan the` keyword triggers were removed; use `ralplan` or explicit `/oh-my-claudecode:omc-plan`.

## Utilities

### Provider Advisor (`omc ask`)

Run local provider CLIs and save a markdown artifact under `.omc/artifacts/ask/`:

```bash
omc ask claude "review this migration plan"
omc ask codex --prompt "identify architecture risks"
omc ask gemini --prompt "propose UI polish ideas"
omc ask claude --agent-prompt executor --prompt "draft implementation steps"
```

Canonical env vars:

- `OMC_ASK_ADVISOR_SCRIPT`
- `OMC_ASK_ORIGINAL_TASK`

Phase-1 aliases `OMX_ASK_ADVISOR_SCRIPT` and `OMX_ASK_ORIGINAL_TASK` are accepted with deprecation warnings.

### Rate Limit Wait

Auto-resume Claude Code sessions when rate limits reset.

```bash
omc --help
omc install
omc setup
omc update
omc wait
omc config-stop-callback --help
omc hud
```

**Requires:** tmux (for session detection)

### Monitoring & Analytics

Use the HUD for live observability and `omc` for cost/session reporting:

- HUD analytics preset: `/oh-my-claudecode:hud setup` then set `"omcHud": { "preset": "analytics" }`
- Cost reports: `omc cost daily|weekly|monthly`
- Session history/backfill: `omc sessions`, `omc backfill`
- Raw logs: `.omc/state/token-tracking.jsonl`, `.omc/state/agent-replay-*.jsonl`

### Notification Tags (Telegram/Discord/Slack)

You can configure who gets tagged when stop callbacks send session summaries.

```bash
# Set/replace tag list
omc config-stop-callback telegram --enable --token <bot_token> --chat <chat_id> --tag-list "@alice,bob"
omc config-stop-callback discord --enable --webhook <url> --tag-list "@here,123456789012345678,role:987654321098765432"
omc config-stop-callback slack --enable --webhook <url> --tag-list "<!here>,<@U1234567890>"

# Incremental updates
omc config-stop-callback telegram --add-tag charlie
omc config-stop-callback discord --remove-tag @here
omc config-stop-callback discord --clear-tags
```

Tag behavior:

- Telegram: `alice` becomes `@alice`
- Discord: supports `@here`, `@everyone`, numeric user IDs, and `role:<id>`
- Slack: supports `<@MEMBER_ID>`, `<!channel>`, `<!here>`, `<!everyone>`, `<!subteam^GROUP_ID>`
- `file` callbacks ignore tag options

---

## Documentation

- **[Full Reference](docs/REFERENCE.md)** - Complete feature documentation
- **[CLI Reference](https://yeachan-heo.github.io/oh-my-claudecode-website/docs.html#cli-reference)** - All `omc` commands, flags, and tools
- **[Notifications Guide](https://yeachan-heo.github.io/oh-my-claudecode-website/docs.html#notifications)** - Discord, Telegram, Slack, and webhook setup
- **[Recommended Workflows](https://yeachan-heo.github.io/oh-my-claudecode-website/docs.html#workflows)** - Battle-tested skill chains for common tasks
- **[Release Notes](https://yeachan-heo.github.io/oh-my-claudecode-website/docs.html#release-notes)** - What's new in each version
- **[Website](https://yeachan-heo.github.io/oh-my-claudecode-website)** - Interactive guides and examples
- **[Migration Guide](docs/MIGRATION.md)** - Upgrade from v2.x
- **[Architecture](docs/ARCHITECTURE.md)** - How it works under the hood
- **[Performance Monitoring](docs/PERFORMANCE-MONITORING.md)** - Agent tracking, debugging, and optimization

---

## Requirements

- Node.js 20+
- [Claude Code](https://docs.anthropic.com/claude-code) CLI
- Claude Max/Pro subscription or Anthropic API key

Optional multi-AI orchestration:

- [Gemini CLI](https://github.com/google-gemini/gemini-cli)
- [Codex CLI](https://github.com/openai/codex)

| Provider                                                  | Install                             | What it enables                                  |
| --------------------------------------------------------- | ----------------------------------- | ------------------------------------------------ |
| [Gemini CLI](https://github.com/google-gemini/gemini-cli) | `npm install -g @google/gemini-cli` | Design review, UI consistency (1M token context) |
| [Codex CLI](https://github.com/openai/codex)              | `npm install -g @openai/codex`      | Architecture validation, code review cross-check |

## Documentation

- [Reference](docs/REFERENCE.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Performance Monitoring](docs/PERFORMANCE-MONITORING.md)
- [Migration Guide](docs/MIGRATION.md)
- [Local Plugin Installation (for local plugin development)](docs/LOCAL_PLUGIN_INSTALL.md)
- [Changelog](CHANGELOG.md)

---

## Support

- [GitHub Issues](https://github.com/Yeachan-Heo/oh-my-claudecode/issues)
- [GitHub Sponsors](https://github.com/sponsors/Yeachan-Heo)

---

## License

MIT

---

<div align="center">

**Inspired by:** [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) • [claude-hud](https://github.com/ryanjoachim/claude-hud) • [Superpowers](https://github.com/obra/superpowers) • [everything-claude-code](https://github.com/affaan-m/everything-claude-code) • [Ouroboros](https://github.com/Q00/ouroboros)

**Zero learning curve. Maximum power.**

</div>

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Yeachan-Heo/oh-my-claudecode&type=date&legend=top-left)](https://www.star-history.com/#Yeachan-Heo/oh-my-claudecode&type=date&legend=top-left)

## 💖 Support This Project

If Oh-My-ClaudeCode helps your workflow, consider sponsoring:

[![Sponsor on GitHub](https://img.shields.io/badge/Sponsor-❤️-red?style=for-the-badge&logo=github)](https://github.com/sponsors/Yeachan-Heo)

### Why sponsor?

- Keep development active
- Priority support for sponsors
- Influence roadmap & features
- Help maintain free & open source

### Other ways to help

- ⭐ Star the repo
- 🐛 Report bugs
- 💡 Suggest features
- 📝 Contribute code
