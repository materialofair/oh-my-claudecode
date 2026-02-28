# Skill Ecosystem Optimization Design

**Date:** 2026-02-26
**Scope:** oh-my-claudecode — full skill quality overhaul (description + structure + quality pipeline)
**Inspiration:** oh-my-codex skill-development, skill-debugger, skill-quality-analyzer, skill-create patterns

---

## Problem Statement

The oh-my-claudecode skill ecosystem has three interconnected issues:

1. **Weak trigger descriptions** — YAML `description` fields are one-liner jargon (e.g., "Full autonomous execution from idea to working code") with no specific trigger phrases. When Claude reads the system-reminder skill list, these descriptions don't tell it _when_ to invoke the skill.

2. **Progressive disclosure violations** — The `skill` management skill is 838 lines; all content is loaded into context every time. The oh-my-codex standard requires ≤200 lines in SKILL.md, with detailed content in `references/`.

3. **Codex-branded ported skills** — `skill-quality-analyzer` and `skill-tester` still reference "Codex CLI" and "Codex skill quality", which is confusing and slightly broken in the Claude Code context.

4. **No writing standard for new skills** — No equivalent of oh-my-codex's `skill-development` guide exists for OMC. New skills get written ad hoc with inconsistent quality.

---

## Architecture

### Trigger System in Claude Code (vs Codex)

Unlike oh-my-codex where descriptions drive auto-triggering, OMC's skills work in two modes:

- **Core workflow skills** (autopilot, ralph, plan, ultrawork, team…): Triggered by `CLAUDE.md` `<skills>` block keyword matching — descriptions are supplementary
- **User-created skills** (`~/.claude/skills/`, `.omc/skills/`): Triggered by description semantic matching — descriptions are critical

**System-reminder display format:**
```
- skill-name: [description content shown verbatim to Claude]
```

Therefore, descriptions should read like a natural "use when" statement, not a capability tagline.

---

## Three-Layer Optimization

### Layer 1: Description Standardization (~30 files, frontmatter edits only)

**Standard format:**
```yaml
description: "Use when user wants [specific scenario] ('[trigger phrase 1]', '[trigger phrase 2]'). [One-sentence capability summary]."
```

**Transformation examples:**

| Skill | Before | After |
|-------|--------|-------|
| `autopilot` | "Full autonomous execution from idea to working code" | "Use when user wants full-auto development ('build me', 'autopilot', 'I want a'). Handles spec→plan→code→QA→validation end-to-end." |
| `plan` | "Strategic planning with optional interview workflow" | "Use when user wants to plan before coding ('plan this', 'plan the', 'let's plan'). Supports interview, direct, consensus, and review modes." |
| `ralph` | "Self-referential loop until task completion with architect verification" | "Use when task must complete guaranteed ('ralph', 'don't stop', 'must complete'). Persistence loop with architect verification." |
| `ultrawork` | "Parallel execution engine for high-throughput task completion" | "Use when multiple independent tasks need parallel execution ('ulw', 'ultrawork', 'run in parallel'). Routes tasks to tiered agents simultaneously." |
| `skill-quality-analyzer` | "Analyzes Codex skill quality with 6-dimension scoring…" | "Use when checking a Claude Code skill's quality ('analyze skill', 'score skill', 'skill quality'). 6-dimension scoring: clarity, structure, examples, triggers, practices, maintainability." |
| `skill-tester` | "Tests Codex skill functionality with TDD approach…" | "Use when verifying a Claude Code skill works correctly ('test skill', 'verify skill behavior'). TDD workflow with trigger tests and functional validation." |

**All skills to update:** autopilot, build-fix, deepinit, learner, note, skill, trace, ultraqa, conductor, skill-tester, skill-quality-analyzer, skill-debugger, analyze, cancel, ccg, code-review, configure-notifications, external-context, hud, learn-about-omc, mcp-setup, omc-doctor, omc-help, omc-setup, pipeline, plan, ralph, ralph-init, ralplan, release, review, sciomc, security-review, tdd, team, ultrapilot, ultrawork, ai-commenting, writing-skills (new)

### Layer 2: Progressive Disclosure for `skill` Management Skill

**Current:** `skills/skill/SKILL.md` — 838 lines, all loaded at invocation

**Target structure:**
```
skills/skill/
├── SKILL.md            (~150 lines — commands overview + core workflow)
├── references/
│   ├── templates.md    (4 skill templates: Error/Workflow/Pattern/Integration)
│   └── setup-guide.md  (setup wizard detail + bash scan scripts)
```

**What stays in SKILL.md:**
- Subcommand overview table (list/add/remove/search/edit/sync/setup/scan)
- Core behavior for each command (condensed, pointer to references/ for detail)
- Error handling format
- Skill quality guidelines (condensed to 4 bullets)

**What moves to references/:**
- All 4 full skill templates (Error Solution, Workflow, Code Pattern, Integration) → `references/templates.md`
- Full bash scripts for directory scanning → `references/setup-guide.md`
- Complete example session → `references/setup-guide.md`

### Layer 3: `writing-skills` Skill (New)

**OMC's equivalent of oh-my-codex's `skill-development`.**

```
skills/writing-skills/
├── SKILL.md                          (~120 lines)
└── references/
    ├── format-guide.md               (XML tag structure, size targets, style rules)
    └── description-patterns.md       (Good/Bad description catalog)
```

**SKILL.md content:**
- When to use (trigger: "write a skill", "create a skill", "new skill")
- OMC Hybrid Workflow: Hard Steps (file creation, frontmatter) + Soft Steps (description quality judgment)
- 6-step process: Understand → Plan → Create structure → Write SKILL.md → Quality-analyze → Test
- Integration: triggers skill-quality-analyzer, skill-debugger, skill-tester
- Validation checklist
- References to `references/format-guide.md` and `references/description-patterns.md`

**`references/format-guide.md` content:**
- XML tag structure: `<Purpose>`, `<Use_When>`, `<Do_Not_Use_When>`, `<Why_This_Exists>`, `<Execution_Policy>`, `<Steps>`, `<Tool_Usage>`, `<Examples>`, `<Escalation_And_Stop_Conditions>`, `<Final_Checklist>`, `<Advanced>`
- When to use XML vs markdown headers (workflow skills → XML; utility skills → markdown)
- Size targets: SKILL.md ≤200 lines, references/ files ≤300 lines each
- Description standard with trigger phrase format

**`references/description-patterns.md` content:**
- Side-by-side catalog of all 30+ skill descriptions (before/after with rationale)
- Pattern library: workflow triggers, delegation triggers, utility triggers
- Anti-patterns with explanations

### Bonus: Adapt Ported Skills

**`skill-quality-analyzer/SKILL.md`:**
- Replace all "Codex" references with "Claude Code"
- Update Agent Workflow section: replace `python3 analyzer.py` with Glob/Read/Grep tool sequence as primary hard-metrics step (keep analyzer.py as optional enhancement)
- Update skill location paths: `~/.codex/skills/` → `~/.claude/skills/` and `.agents/skills/` → `.claude/skills/`

**`skill-tester/SKILL.md`:**
- Replace all "Codex" references with "Claude Code"
- Remove JSON-based test case format (more Codex-native) — replace with scenario-based format
- Simplify: this skill is mainly used for "does the skill trigger?" and "does it produce the right output?" — remove performance testing and coverage metrics (overkill for prompt-based skills)

---

## What We Are NOT Doing

- No changes to body content of autopilot/ralph/plan/ultrawork/team — XML structure is well-designed
- No rewrite of `analyzer.py` Python script — functional, keep as optional tool
- No `version` field added to frontmatter — no versioning system in OMC
- No changes to `project-session-manager/` shell scripts — not a skill content issue
- No changes to `CLAUDE.md` skill trigger keywords — those work correctly

---

## Acceptance Criteria

1. All skill descriptions follow "Use when user [scenario] ('[trigger]'). [Summary]." format
2. `skill/SKILL.md` is ≤200 lines; templates and scripts moved to `references/`
3. `writing-skills/` skill exists with SKILL.md + 2 references files
4. `skill-quality-analyzer/SKILL.md` and `skill-tester/SKILL.md` contain no "Codex" references
5. Running `skill-quality-analyzer` on `writing-skills` returns score ≥80
6. No existing skill functionality is removed — only descriptions and structure change

---

## Implementation Order

1. Create `writing-skills/` skill (establishes the standard we'll apply)
2. Update all descriptions (Layer 1) — mechanical, high volume
3. Refactor `skill/` (Layer 2) — structural surgery on largest skill
4. Update `skill-quality-analyzer` and `skill-tester` (ported skill adaptation)
