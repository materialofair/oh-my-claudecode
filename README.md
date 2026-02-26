English | [한국어](README.ko.md) | [中文](README.zh.md) | [日本語](README.ja.md) | [Español](README.es.md) | [Tiếng Việt](README.vi.md) | [Português](README.pt.md)

# oh-my-claudecode

[![npm version](https://img.shields.io/npm/v/claudecode-omc?color=cb3837)](https://www.npmjs.com/package/claudecode-omc)
[![npm downloads](https://img.shields.io/npm/dm/claudecode-omc?color=blue)](https://www.npmjs.com/package/claudecode-omc)
[![GitHub stars](https://img.shields.io/github/stars/Yeachan-Heo/oh-my-claudecode?style=flat&color=yellow)](https://github.com/Yeachan-Heo/oh-my-claudecode/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4%EF%B8%8F-red?style=flat&logo=github)](https://github.com/sponsors/Yeachan-Heo)

> **For Codex users:** [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) provides a similar orchestration experience for OpenAI Codex CLI.

Multi-agent orchestration for Claude Code with zero-friction setup.

[Quick Start](#quick-start) • [Reference](docs/REFERENCE.md) • [Architecture](docs/ARCHITECTURE.md) • [Migration](docs/MIGRATION.md)

---

## What Changed

This project is branded as **oh-my-claudecode**, and the npm package is published as **`claudecode-omc`**.

- Legacy plugin-marketplace install flow is no longer the primary path in this README.
- Use npm package installation and OMC CLI setup commands.
- Multiple executable entrypoints are provided from the same package.

---

## Quick Start

### 1. Install

```bash
npm install -g claudecode-omc
```

### 2. Bootstrap Claude Code Integration

```bash
omc install
omc setup
```

### 3. Start Working

```text
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

## Team Mode (Recommended)

Team is the canonical orchestration surface.

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

- Team-first orchestration
- Autopilot, Ralph, Ultrawork, Pipeline execution modes
- Specialized agent delegation with tiered model routing
- Hook-driven automation and verification loops
- Built-in analytics and cost tracking

See full details in [docs/REFERENCE.md](docs/REFERENCE.md).

---

## Useful Commands

```bash
omc --help
omc install
omc setup
omc update
omc wait
omc config-stop-callback --help
omc hud
```

---

## Requirements

- Node.js 20+
- [Claude Code](https://docs.anthropic.com/claude-code) CLI
- Claude Max/Pro subscription or Anthropic API key

Optional multi-AI orchestration:

- [Gemini CLI](https://github.com/google-gemini/gemini-cli)
- [Codex CLI](https://github.com/openai/codex)

---

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
