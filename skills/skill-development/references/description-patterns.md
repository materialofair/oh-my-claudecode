# Description Patterns — Good/Bad Catalog

Reference for writing the `description` field in SKILL.md frontmatter.

Claude sees this description in the system-reminder when deciding whether to invoke a skill.
Format: `"This skill should be used when the user asks to '[trigger]', '[trigger]'. [Summary]."`

---

## The Format Standard

```yaml
# Auto-discovery skills (user/project skills):
description: "This skill should be used when the user asks to '[trigger 1]', '[trigger 2]', or '[trigger 3]'. [One-sentence summary]."

# OMC core workflow skills (also triggered by CLAUDE.md keywords):
description: "[Capability summary]. Triggered by: '[kw1]', '[kw2]'."
```

**Required**: At least 2 quoted trigger phrases using `'single quotes'`.

---

## Anti-Pattern Catalog

### Anti-pattern 1: Tagline instead of trigger

```yaml
# ❌ Tagline — describes what it IS, not WHEN to use it
description: Full autonomous execution from idea to working code
description: Parallel execution engine for high-throughput task completion
description: Self-referential loop until task completion with architect verification

# ✅ Trigger-forward
description: "Use when user wants full-auto development ('build me', 'autopilot', 'I want a'). End-to-end pipeline from idea to verified code."
description: "Use when running multiple independent tasks in parallel ('ulw', 'ultrawork', 'run in parallel'). Tiered agent routing with haiku/sonnet/opus."
description: "Use when task must complete guaranteed ('ralph', 'don't stop', 'must complete'). Persistence loop with architect sign-off."
```

### Anti-pattern 2: Wrong platform branding

```yaml
# ❌ Platform-specific (Codex, not Claude Code)
description: Analyzes Codex skill quality with 6-dimension scoring system
description: Tests Codex skill functionality with TDD approach

# ✅ Platform-neutral
description: "This skill should be used when the user asks to 'analyze skill quality', 'score skill', or 'skill quality report'. 6-dimension scoring for Claude Code skills."
description: "This skill should be used when the user asks to 'test skill', 'verify skill', or 'skill test'. Trigger tests and behavioral validation for Claude Code skills."
```

### Anti-pattern 3: Second person in description

```yaml
# ❌ Second person
description: Use this skill when you want to plan before coding
description: Load this skill when user asks for parallel execution

# ✅ Third person or neutral
description: "This skill should be used when the user asks to 'plan this', 'plan the', or 'let's plan'. Interview, direct, consensus, and review modes."
```

### Anti-pattern 4: No trigger phrases (vague)

```yaml
# ❌ Vague — no specific triggers
description: Helps with various tasks
description: Provides guidance for working with hooks
description: Deep analysis and investigation

# ✅ Specific
description: "This skill should be used when the user asks to 'create a hook', 'add validation hook', or 'configure hook behavior'. Full hook development with examples."
description: "Use when debugging or investigating failures ('analyze', 'debug', 'investigate', 'why is this failing'). Delegates to debugger agent for root-cause analysis."
```

---

## Pattern Catalog by Category

### Workflow / Orchestration Skills

These are invoked by keyword — triggers must match CLAUDE.md `<skills>` section keywords.

```yaml
# autopilot
description: "Use when user wants full-auto development ('build me', 'autopilot', 'I want a', 'create me'). End-to-end: spec→plan→code→QA→validation with no manual intervention."

# ralph
description: "Use when task must complete guaranteed ('ralph', 'don't stop', 'must complete', 'finish this'). Persistence loop with ultrawork parallelism and architect sign-off."

# ultrawork
description: "Use when running multiple independent tasks in parallel ('ulw', 'ultrawork', 'run in parallel'). Tiered agent routing: haiku/sonnet/opus fired simultaneously."

# plan
description: "Use when planning before coding ('plan this', 'plan the', 'let's plan', 'make a plan'). Interview, direct, consensus (--consensus), and review (--review) modes."

# team
description: "Use when coordinating multiple agents on a project ('team', 'coordinated team', 'multi-agent', 'swarm'). TeamCreate→tasks→parallel agents→verify→TeamDelete pipeline."
```

### Quality / Skill Tooling

```yaml
# writing-skills
description: "This skill should be used when the user asks to 'create a skill', 'write a new skill', 'add a skill', or 'improve an existing skill'. Covers structure, description quality, progressive disclosure, and the quality pipeline."

# skill-quality-analyzer
description: "This skill should be used when the user asks to 'analyze skill quality', 'score skill', 'skill quality report', or 'audit skill'. 6-dimension scoring: clarity, structure, examples, triggers, practices, maintainability."

# skill-debugger
description: "This skill should be used when the user asks to 'debug skill', 'skill not triggering', 'why isn't skill working', or 'skill discovery issue'. Diagnoses description quality, naming, conflicts, and file structure."

# skill-tester
description: "This skill should be used when the user asks to 'test skill', 'verify skill', 'does this skill trigger', or 'skill test'. Trigger tests, functional tests, and edge case validation."
```

### Domain / Code Skills

```yaml
# tdd
description: "This skill should be used when the user asks to 'tdd', 'test first', 'red green refactor', or 'write tests first'. Enforces Red→Green→Refactor cycle — no implementation before failing test."

# security-review
description: "This skill should be used when the user asks to 'security review', 'check for vulnerabilities', 'OWASP audit', or 'security scan'. Comprehensive review across OWASP Top 10, authn/authz, and trust boundaries."

# code-review
description: "This skill should be used when the user asks to 'code review', 'review this PR', 'review code', or 'check my code'. Multi-layer review: style, quality, security, API compatibility, performance."

# ai-commenting
description: "This skill should be used when the user asks to 'ai comment', 'annotate code', 'add ai tags', or 'mark high-risk code'. Machine-parseable @ai: protocol for risk, intent, deps, auth, invariants."
```

### Utility / Management Skills

```yaml
# note
description: "This skill should be used when the user asks to 'note', 'remember this', 'save note', or 'notepad'. Persists to .omc/notepad.md — survives context compaction."

# cancel
description: "This skill should be used when the user wants to 'cancel', 'stop', or 'abort' an active OMC mode. Cleanly exits autopilot, ralph, ultrawork, ultraqa, team, pipeline state."

# trace
description: "This skill should be used when the user asks to 'trace', 'show agent trace', 'what agents ran', or 'session timeline'. Renders timeline of agent calls and results."

# hud
description: "This skill should be used when the user asks to 'hud', 'configure display', 'hud layout', or 'status bar'. Sets layout, visible elements, and display presets."
```

---

## Quick Self-Check

Before finalizing a description, ask:

1. **Natural?** Would a user actually say these trigger phrases?
2. **Specific?** Would it distinguish this skill from similar ones?
3. **Quoted?** Does it contain at least 2 phrases in `'single quotes'`?
4. **Summarized?** Does the last sentence say what it produces?

If all 4 are yes → the description is ready.
