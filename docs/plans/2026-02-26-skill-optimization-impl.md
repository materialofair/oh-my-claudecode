# Skill Ecosystem Optimization — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Optimize all ~40 oh-my-claudecode skills: precise trigger descriptions, progressive disclosure for heavy skills, new `writing-skills` standard, and de-Codex ported skills.

**Architecture:** Three-layer overhaul — (1) YAML description standardization across all skills, (2) progressive disclosure refactor of `skill/` (838→~150 lines), (3) new `writing-skills/` quality pipeline skill + de-Codex adaptation of `skill-quality-analyzer` and `skill-tester`.

**Tech Stack:** Markdown, YAML frontmatter, Bash (for verification); no code compilation needed.

**Design doc:** `docs/plans/2026-02-26-skill-optimization-design.md`

**Skill directory:** `/Users/WangQiao/Desktop/github/ios-dev/ZeroNet-Space/openSource/oh-my-cc/oh-my-claudecode/skills/`

---

## Task 1: Create `writing-skills/` Skill (New)

**Files:**
- Create: `skills/writing-skills/SKILL.md`
- Create: `skills/writing-skills/references/format-guide.md`
- Create: `skills/writing-skills/references/description-patterns.md`

**Step 1: Create directory structure**
```bash
mkdir -p skills/writing-skills/references
```

**Step 2: Create `skills/writing-skills/SKILL.md`**

```markdown
---
name: writing-skills
description: "Use when creating or improving a Claude Code skill ('write a skill', 'create a skill', 'new skill', 'improve this skill'). OMC standard for skill authorship: description format, XML structure, progressive disclosure, quality pipeline."
---

<Purpose>
Writing-skills is the OMC authorship guide for creating and improving Claude Code skills. It defines the standard format (YAML frontmatter + XML body), description trigger-phrase conventions, size targets, progressive disclosure patterns, and the quality pipeline that every skill should pass before shipping.
</Purpose>

<Use_When>
- User wants to create a new skill from scratch
- User wants to improve an existing skill's description, structure, or content
- User says "write a skill", "new skill", "create a skill", "skill template"
- A skill is not triggering and the description needs to be redesigned
- A skill is too long and needs progressive disclosure refactoring
</Use_When>

<Do_Not_Use_When>
- User wants to debug why a skill isn't triggering -- use `skill-debugger` instead
- User wants to score skill quality -- use `skill-quality-analyzer` instead
- User wants to test if a skill triggers correctly -- use `skill-tester` instead
- User wants to manage (list/add/remove) installed skills -- use `skill` instead
</Do_Not_Use_When>

<Why_This_Exists>
Without a writing standard, OMC skills accumulate inconsistently: vague descriptions that don't trigger, monolithic SKILL.md files that bloat context, Codex-style conventions that don't fit Claude Code. This skill establishes the canonical pattern so every new skill is immediately high quality.
</Why_This_Exists>

<Execution_Policy>
- Follow the Hybrid Workflow: Hard Steps (file creation, tool-verifiable checks) first, Soft Steps (description quality judgment) second
- Always verify description contains at least 2 specific trigger phrases in quotes
- Target SKILL.md body ≤200 lines; move detail to references/ when exceeded
- Run `skill-quality-analyzer` before declaring a skill done
- Consult `references/format-guide.md` for XML tag structure details
- Consult `references/description-patterns.md` for description examples by category
</Execution_Policy>

<Steps>

### Hybrid Workflow

**Hard Step 1 (tool): Check if skill directory exists**
```bash
ls skills/<skill-name>/ 2>/dev/null || echo "NEW"
```

**Soft Step 1 (judgment): Gather concrete trigger examples**
Ask: "What are 3 exact phrases a user would say to trigger this skill?"
These become the quoted trigger phrases in the description.

**Hard Step 2 (tool): Create directory structure**
```bash
mkdir -p skills/<skill-name>/references
```

**Soft Step 2 (judgment): Choose body format**
- Workflow/process skills (autopilot, ralph, plan) → XML tag format
- Utility/tool skills (note, trace, hud) → markdown header format

**Hard Step 3 (tool): Write SKILL.md**
Frontmatter (required):
```yaml
---
name: skill-name
description: "Use when user [specific scenario] ('[trigger 1]', '[trigger 2]', '[trigger 3]'). [One-sentence capability summary]."
---
```
Body: follow XML or markdown format per Step 2 above. Target ≤200 lines.

**Hard Step 4 (tool): Verify description format**
```bash
grep "^description:" skills/<skill-name>/SKILL.md | grep -q '"' && echo "OK: has quotes" || echo "FAIL: missing trigger phrases"
```

**Soft Step 3 (judgment): Check progressive disclosure**
If SKILL.md body > 200 lines: identify what to move to `references/`.
- Detailed reference tables → `references/`
- Long examples → `references/`
- Utility scripts → `scripts/` (if applicable)

**Hard Step 5 (tool): Run quality check**
```
Invoke Skill("oh-my-claudecode:skill-quality-analyzer") on the new skill path.
Target score ≥80.
```

**Hard Step 6 (tool): Commit**
```bash
git add skills/<skill-name>/
git commit -m "feat(skills): add <skill-name> skill"
```

### Full Process Checklist

1. Understand use cases (get 3 concrete trigger examples)
2. Choose format (XML for workflow, markdown for utility)
3. Create directory: `mkdir -p skills/<name>/references`
4. Write SKILL.md: frontmatter + body ≤200 lines
5. Write references/ files if needed
6. Verify: description has quoted triggers, line count within target
7. Run skill-quality-analyzer (score ≥80)
8. Commit

</Steps>

<Tool_Usage>
- Use `Glob("**/SKILL.md")` to check existing skills for reference and conflict detection
- Use `Read` to examine existing skills as templates
- Use `Grep` to check description format patterns across all skills
- Use `Bash` for line count checks: `wc -l skills/<name>/SKILL.md`
- Consult `references/format-guide.md` for complete XML tag reference
- Consult `references/description-patterns.md` for Good/Bad description catalog
</Tool_Usage>

<Examples>
<Good>
Creating a new skill with correct description:
```yaml
---
name: api-validator
description: "Use when validating API contracts or checking endpoint compatibility ('validate api', 'check api contract', 'api breaking change'). Runs schema validation and backward compatibility checks."
---
```
Why good: Third-party perspective, quoted triggers, one-sentence summary.
</Good>

<Good>
Correctly using progressive disclosure:
```
skills/heavy-skill/
├── SKILL.md              (150 lines — core workflow only)
└── references/
    ├── patterns.md       (detailed patterns reference)
    └── examples.md       (worked examples)
```
Why good: SKILL.md stays lean; detail loaded only when needed.
</Good>

<Bad>
Vague description with no trigger phrases:
```yaml
description: Provides guidance for API validation tasks
```
Why bad: No quoted trigger phrases; "provides guidance" is jargon; won't trigger reliably.
</Bad>

<Bad>
Monolithic SKILL.md:
```
skills/heavy-skill/
└── SKILL.md   (850 lines — everything in one file)
```
Why bad: Full 850 lines loaded into context every invocation. Move detail to references/.
</Bad>
</Examples>

<Escalation_And_Stop_Conditions>
- If skill-quality-analyzer scores below 60, fix Critical and High issues before shipping
- If description trigger phrases don't feel natural, ask the user "would you actually say this?"
- If references/ files grow beyond 400 lines each, split further
</Escalation_And_Stop_Conditions>

<Final_Checklist>
- [ ] SKILL.md frontmatter has name and description
- [ ] Description contains at least 2 quoted trigger phrases
- [ ] Description written from "Use when user..." perspective
- [ ] SKILL.md body ≤200 lines
- [ ] Referenced files in references/ actually exist
- [ ] No "Codex", "Codex CLI", or other platform-specific branding in body
- [ ] skill-quality-analyzer score ≥80
- [ ] Committed with `feat(skills):` commit message
</Final_Checklist>

<Advanced>
## XML Tag Reference

See `references/format-guide.md` for complete tag-by-tag guide.

Quick reference:
- `<Purpose>` — what it does and produces
- `<Use_When>` — trigger conditions (specific)
- `<Do_Not_Use_When>` — negative triggers (redirect to correct skill)
- `<Why_This_Exists>` — rationale (prevents misuse)
- `<Execution_Policy>` — hard rules for execution
- `<Steps>` — ordered procedure
- `<Tool_Usage>` — which tools and when
- `<Examples>` — Good/Bad with explanations
- `<Escalation_And_Stop_Conditions>` — when to stop or escalate
- `<Final_Checklist>` — verification gate
- `<Advanced>` — detail deferred until needed (progressive disclosure)

## Description Format Reference

See `references/description-patterns.md` for catalog.

Format: `"Use when user [scenario] ('[trigger 1]', '[trigger 2]'). [Summary]."`

Three categories:
1. **Workflow triggers**: user wants to do something big (autopilot, ralph, plan)
2. **Command triggers**: user invokes by name (cancel, trace, hud)
3. **Domain triggers**: user has a domain problem (security-review, tdd, code-review)
</Advanced>
```

**Step 3: Create `skills/writing-skills/references/format-guide.md`**

Content — complete XML tag reference for OMC skills (see implementation notes below). ~180 lines.

Key sections:
- When to use XML vs markdown headers
- Tag-by-tag reference with purpose, required/optional, anti-patterns
- Size targets (SKILL.md ≤200 lines, references/ ≤400 lines each)
- Progressive disclosure decision guide

**Step 4: Create `skills/writing-skills/references/description-patterns.md`**

Content — Good/Bad description catalog for all ~40 OMC skill categories. ~200 lines.

Key sections:
- Format standard with annotated example
- Workflow skills patterns (autopilot, ralph, plan, ultrawork, team)
- Utility skills patterns (note, trace, hud, cancel)
- Domain skills patterns (tdd, security-review, code-review, ai-commenting)
- Anti-patterns (vague taglines, platform branding, missing trigger quotes)

**Step 5: Verify**
```bash
wc -l skills/writing-skills/SKILL.md
# Target: ≤200 lines

grep -c "description" skills/writing-skills/SKILL.md
# Should find description in frontmatter
```

**Step 6: Commit**
```bash
git add skills/writing-skills/
git commit -m "feat(skills): add writing-skills authorship guide"
```

---

## Task 2: Update All Skill Descriptions (Layer 1)

**Files:** All `skills/*/SKILL.md` — frontmatter `description` field only

**Target format:** `"Use when user [scenario] ('[trigger]', '[trigger]'). [Summary]."`

**Step 1: Apply all description rewrites**

Edit the `description:` line in each skill's frontmatter. Complete rewrite table:

| Skill | New Description |
|-------|----------------|
| `ai-commenting` | `"Use when annotating high-risk code with AI-readable metadata ('ai comment', 'annotate code', 'add ai tags'). Machine-parseable @ai: protocol encoding risk, intent, deps, auth, invariants."` |
| `analyze` | `"Use when debugging or investigating failures ('analyze', 'debug', 'investigate', 'why is this failing'). Delegates to debugger agent for root-cause analysis and regression isolation."` |
| `autopilot` | `"Use when user wants full-auto development ('build me', 'autopilot', 'I want a', 'create me'). End-to-end pipeline: spec→plan→code→QA→validation with no manual intervention."` |
| `build-fix` | `"Use when build or TypeScript compilation fails ('fix build', 'type errors', 'compilation error', 'build broken'). Minimal-diff fixes via build-fixer agent; no architectural changes."` |
| `cancel` | `"Use to cancel any active OMC execution mode ('cancel', 'stop', 'abort'). Cleanly exits autopilot, ralph, ultrawork, ultraqa, team, and pipeline state."` |
| `ccg` | `"Use when task benefits from tri-model parallel AI ('ccg', 'use all models', 'fan out to codex and gemini'). Backend→Codex, UI→Gemini, Claude synthesizes results."` |
| `code-review` | `"Use when reviewing code or PRs ('code review', 'review this PR', 'review code', 'check my code'). Multi-layer review: style, quality, security, API compatibility, and performance."` |
| `conductor` | `"Use when wanting structured Context→Spec→Implement workflow ('conductor', 'structured workflow', 'gather context then plan'). Ensures spec and plan are solid before execution."` |
| `configure-notifications` | `"Use when setting up agent completion notifications ('configure notifications', 'notify me on Telegram', 'Discord webhook', 'Slack alerts'). Natural language configuration of notification integrations."` |
| `deepinit` | `"Use when initializing a new codebase for agent work ('deepinit', 'initialize codebase', 'generate AGENTS.md', 'document codebase'). Creates hierarchical agent documentation across all modules."` |
| `external-context` | `"Use when needing external web or documentation lookup ('research', 'look up docs', 'search for', 'find documentation on'). Prefers Gemini MCP; falls back to parallel document-specialist agents."` |
| `hud` | `"Use when configuring the status bar display ('hud', 'configure display', 'hud layout', 'status bar presets'). Sets layout, visible elements, and display presets."` |
| `learn-about-omc` | `"Use when wanting OMC usage tips or personalized recommendations ('learn about omc', 'omc tips', 'how do I use omc', 'what omc features exist'). Reviews session history and suggests optimizations."` |
| `learner` | `"Use after solving a tricky bug or discovering a non-obvious pattern ('save this as a skill', 'extract skill', 'learn this', 'remember this pattern'). Packages conversation insight into a reusable skill."` |
| `mcp-setup` | `"Use when setting up MCP servers for Claude Code ('mcp setup', 'configure mcp', 'add mcp server', 'install context7'). Interactive wizard for Context7, filesystem, GitHub, and other MCP integrations."` |
| `note` | `"Use when saving quick notes that must survive context compaction ('note', 'remember this', 'save note', 'notepad'). Persists to .omc/notepad.md — survives /compact and session restarts."` |
| `omc-doctor` | `"Use when OMC is broken or behaving unexpectedly ('omc doctor', 'diagnose omc', 'fix omc', 'hooks not working'). Checks installation, hooks, config, and attempts automatic repair."` |
| `omc-help` | `"Use when asking how OMC works or what commands are available ('help', 'omc help', 'what can omc do', 'how do I'). Contextual guide with examples and command reference."` |
| `omc-setup` | `"Use when installing or reconfiguring oh-my-claudecode ('omc setup', 'setup omc', 'install omc', 'configure omc'). One-command wizard for hooks, MCP servers, HUD, and settings."` |
| `pipeline` | `"Use when chaining agents sequentially with data passing ('pipeline', 'chain agents', 'sequential workflow', 'agent pipeline'). Supports branching and error handling between stages."` |
| `plan` | `"Use when planning before coding ('plan this', 'plan the', 'let's plan', 'make a plan'). Interview, direct, consensus (--consensus), and review (--review) modes."` |
| `project-session-manager` | `"Use when managing isolated dev environments ('psm', 'project session', 'worktree session', 'open in tmux'). Creates git worktree + tmux session combos for parallel feature development."` |
| `ralph-init` | `"Use when starting a large task that needs structured requirements ('ralph-init', '--prd', 'create PRD', 'user stories first'). Generates PRD with user stories and acceptance criteria before ralph loop."` |
| `ralph` | `"Use when task must complete regardless of difficulty ('ralph', 'don't stop', 'must complete', 'finish this', 'keep going'). Persistence loop with ultrawork parallelism and architect sign-off."` |
| `ralplan` | `"Use when wanting multi-perspective plan validation ('ralplan', 'consensus plan', 'plan with multiple agents reviewing'). Alias for /plan --consensus: Planner→Architect→Critic iteration loop."` |
| `release` | `"Use when cutting a new release of oh-my-claudecode ('release', 'cut release', 'publish version', 'new release'). Automates changelog, version bump, tag, and npm publish."` |
| `review` | `"Use when reviewing or critiquing an existing plan ('review plan', 'critique plan', 'review this plan', 'is this plan good'). Alias for /plan --review: Critic evaluation with APPROVED/REVISE/REJECT verdict."` |
| `sciomc` | `"Use when doing data analysis or research with multiple agents ('sciomc', 'parallel research', 'analyze data with multiple agents', 'scientist swarm'). AUTO mode self-decomposes task; spawns parallel scientist agents."` |
| `security-review` | `"Use when checking code for security vulnerabilities ('security review', 'check for vulnerabilities', 'OWASP audit', 'security scan'). Comprehensive review: OWASP Top 10, authn/authz, trust boundaries."` |
| `skill-debugger` | `"Use when a skill isn't triggering or behaving unexpectedly ('debug skill', 'skill not triggering', 'why isn't skill working', 'skill discovery issue'). Diagnoses description quality, naming, conflicts, and file structure."` |
| `skill-quality-analyzer` | `"Use when checking a Claude Code skill's quality ('analyze skill quality', 'score skill', 'skill quality report', 'audit skill'). 6-dimension scoring: clarity, structure, examples, triggers, practices, maintainability."` |
| `skill-tester` | `"Use when verifying a Claude Code skill works as expected ('test skill', 'verify skill', 'does this skill trigger', 'skill test'). Trigger tests, functional tests, and edge case validation."` |
| `skill` | `"Use when managing local Claude Code skills ('skill list', 'skill add', 'skill remove', 'skill search', 'skill sync'). CRUD + setup wizard for ~/.claude/skills/ and .omc/skills/."` |
| `tdd` | `"Use when implementing features with test-first discipline ('tdd', 'test first', 'red green refactor', 'write tests first', 'TDD'). Enforces Red→Green→Refactor cycle with no implementation before failing test."` |
| `team` | `"Use when coordinating multiple agents on a project ('team', 'coordinated team', 'multi-agent', 'swarm'). TeamCreate→tasks→parallel agents→verify→TeamDelete staged pipeline."` |
| `trace` | `"Use when reviewing what agents ran in a session ('trace', 'show agent trace', 'what agents ran', 'session timeline'). Renders timeline of agent calls, durations, and results."` |
| `ultrapilot` | `"Use when running autopilot with maximum file-partitioned parallelism ('ultrapilot', 'parallel autopilot', 'parallel build'). File-ownership partitioned parallel execution; facade over Team staged pipeline."` |
| `ultraqa` | `"Use when cycling QA until all tests pass ('ultraqa', 'qa loop', 'fix until tests pass', 'keep fixing until green'). Build→test→lint→fix cycle, repeats up to configured limit."` |
| `ultrawork` | `"Use when running multiple independent tasks in parallel ('ulw', 'ultrawork', 'run in parallel', 'parallel execution'). Routes tasks to tiered agents (haiku/sonnet/opus) simultaneously."` |
| `writer-memory` | `"Use when writing fiction and needing persistent story tracking ('writer-memory', 'track characters', 'remember scenes', 'writing continuity'). Maintains character, relationship, scene, and theme state across sessions."` |

**Step 2: Verify descriptions have trigger quotes**
```bash
# Check all descriptions contain quoted trigger phrases
for f in skills/*/SKILL.md; do
  skill=$(basename $(dirname $f))
  desc=$(grep -m1 "^description:" "$f")
  if echo "$desc" | grep -q "'"; then
    echo "✅ $skill"
  else
    echo "❌ $skill — missing quoted triggers"
  fi
done
```
Expected: all ✅

**Step 3: Commit**
```bash
git add skills/
git commit -m "feat(skills): standardize all skill descriptions with trigger phrases"
```

---

## Task 3: Refactor `skill/SKILL.md` — Progressive Disclosure

**Files:**
- Modify: `skills/skill/SKILL.md` (838→~150 lines)
- Create: `skills/skill/references/templates.md`
- Create: `skills/skill/references/setup-guide.md`

**Step 1: Create references directory**
```bash
mkdir -p skills/skill/references
```

**Step 2: Move content to `references/templates.md`**

Extract these four complete templates from `skills/skill/SKILL.md` into `references/templates.md`:
- Error Solution Template
- Workflow Skill Template
- Code Pattern Template
- Integration Skill Template

Add header:
```markdown
# Skill Templates Reference

Templates for creating new skills via `/skill add`. Copy and customize.
```

**Step 3: Move content to `references/setup-guide.md`**

Extract from `skills/skill/SKILL.md` into `references/setup-guide.md`:
- Step 1 directory check + bash script (the full `if [ -d "$USER_SKILLS_DIR" ]` block)
- Step 2 skill scan bash script (the `find "$HOME/.claude/skills/omc-learned"` block)
- Example session (the `> /oh-my-claudecode:skill list` full output example)
- Implementation Notes section
- Future Enhancements section

Add header:
```markdown
# Setup Guide & Examples Reference

Detailed setup wizard behavior and complete usage examples.
```

**Step 4: Rewrite `skills/skill/SKILL.md`** to lean version

Lean SKILL.md keeps:
- Frontmatter (updated description from Task 2)
- Subcommands overview table (name | behavior | example)
- Core behavior for each command — condensed to 3-5 bullets max
- Error handling format (4 lines)
- Skill quality guidelines (4 bullets)
- Reference pointers to `references/templates.md` and `references/setup-guide.md`
- Related skills
- Usage examples (quick reference only, no full session output)

**Step 5: Verify line count**
```bash
wc -l skills/skill/SKILL.md
# Target: ≤200 lines

wc -l skills/skill/references/templates.md skills/skill/references/setup-guide.md
# Each should be reasonable (100-300 lines)
```

**Step 6: Verify references are linked**
```bash
grep "references/" skills/skill/SKILL.md
# Should show both references/templates.md and references/setup-guide.md mentioned
```

**Step 7: Commit**
```bash
git add skills/skill/
git commit -m "refactor(skills): progressive disclosure for skill management skill (838→~150 lines)"
```

---

## Task 4: De-Codex `skill-quality-analyzer/SKILL.md`

**Files:** Modify: `skills/skill-quality-analyzer/SKILL.md`

**Step 1: Replace all "Codex" references**

Find and replace:
- "Analyzes Codex skill quality" → "Analyzes Claude Code skill quality"
- "Codex CLI" → "Claude Code"
- "Codex skill" → "Claude Code skill"
- "Codex standards" → "Claude Code standards"
- "Codex naming conventions" → "Claude Code naming conventions"
- In path examples: `~/.codex/skills/` → `~/.claude/skills/`; `.agents/skills/` → `.claude/skills/`

**Step 2: Update Agent Workflow section**

Replace the Codex-specific Hybrid Workflow with Claude Code tool-based workflow:

```markdown
## Agent Workflow

To analyze effectively, follow this **Hybrid Workflow**:

1. **Hard Metrics (tool-based)**: Use `Glob` and `Read` tools to gather objective data:
   - Check if `SKILL.md` exists: `Glob("skills/<name>/SKILL.md")`
   - Count lines: note `wc -l` equivalent via Read
   - Verify YAML frontmatter has `name` and `description`
   - Check description contains quoted trigger phrases
   - Verify any referenced `references/` files exist
   - If `analyzer.py` exists in the skill directory, optionally run: `python3 skills/<name>/analyzer.py --skill-path skills/<name>/`

2. **Soft Metrics (agent judgment)**: Read the target skill's content and assess:
   - Is the description specific enough to trigger reliably?
   - Does the body use consistent format (XML or markdown headers)?
   - Are examples present and concrete?
   - Is content lean (≤200 lines for SKILL.md)?

3. **Synthesize Report**: Combine hard metrics + soft judgment into severity-ranked findings.
```

**Step 3: Verify no "Codex" remains**
```bash
grep -i "codex" skills/skill-quality-analyzer/SKILL.md
# Expected: no output
```

**Step 4: Commit**
```bash
git add skills/skill-quality-analyzer/SKILL.md
git commit -m "fix(skills): adapt skill-quality-analyzer for Claude Code (remove Codex branding)"
```

---

## Task 5: De-Codex and Simplify `skill-tester/SKILL.md`

**Files:** Modify: `skills/skill-tester/SKILL.md`

**Step 1: Replace frontmatter description**

Use the new description from Task 2:
```yaml
description: "Use when verifying a Claude Code skill works as expected ('test skill', 'verify skill', 'does this skill trigger', 'skill test'). Trigger tests, functional tests, and edge case validation."
```

**Step 2: Replace all "Codex" references**

- "Tests Codex skill functionality" → "Tests Claude Code skill behavior"
- "Codex CLI" → "Claude Code"
- "Codex skill" → "Claude Code skill"
- All path examples: `~/.codex/skills/` → `~/.claude/skills/`

**Step 3: Simplify test case format**

Replace the JSON-heavy test case structure (designed for Codex function calls) with scenario-based format for prompt skills:

```markdown
## Test Case Format for Claude Code Skills

Since Claude Code skills are prompt-based (not function calls), test cases describe scenarios:

**Trigger Test:**
```
Scenario: User says "review my code"
Expected: code-review skill activates
Verify: Skill tool invoked with "code-review"
```

**Behavioral Test:**
```
Scenario: User says "build me a todo app"
Expected: autopilot skill activates and begins Phase 0 expansion
Verify: analyst and architect agents spawned within 2 turns
```

**Negative Test:**
```
Scenario: User says "what is React?"
Expected: NO skill invokes (just answer the question)
Verify: No Skill tool call in response
```
```

**Step 4: Remove performance testing section** (not applicable to prompt-based skills)

Remove:
- "Performance Tests" subsection
- "Performance Benchmarks" section
- Time-limit scoring table

**Step 5: Verify no "Codex" remains**
```bash
grep -i "codex" skills/skill-tester/SKILL.md
# Expected: no output
```

**Step 6: Verify line count reduced** (target: from 346 lines to ~180 lines)
```bash
wc -l skills/skill-tester/SKILL.md
```

**Step 7: Commit**
```bash
git add skills/skill-tester/SKILL.md
git commit -m "fix(skills): adapt skill-tester for Claude Code prompt-based skill testing"
```

---

## Task 6: Final Verification

**Step 1: Check all descriptions have trigger quotes**
```bash
echo "=== Skills WITHOUT quoted triggers ==="
for f in skills/*/SKILL.md; do
  skill=$(basename $(dirname $f))
  desc=$(grep -m1 "^description:" "$f")
  if ! echo "$desc" | grep -q "'"; then
    echo "❌ $skill"
  fi
done
echo "=== Done ==="
```
Expected: no output after "==="

**Step 2: Check no Codex branding remains in user-facing skills**
```bash
grep -rl "Codex" skills/*/SKILL.md | grep -v "ccg"
# ccg intentionally references Codex (it IS a Codex skill)
# All other results are problems
```

**Step 3: Check skill/ line count**
```bash
wc -l skills/skill/SKILL.md
# Target: ≤200
```

**Step 4: Verify writing-skills/ files exist**
```bash
ls skills/writing-skills/
ls skills/writing-skills/references/
```
Expected: SKILL.md, references/format-guide.md, references/description-patterns.md

**Step 5: Commit verification pass**
```bash
git log --oneline -6
# Should show all 5 task commits
```

---

## Execution Notes

- All changes are Markdown file edits — no compilation needed
- The `ccg` skill intentionally keeps "Codex" in description (it IS about Codex integration)
- `analyzer.py` in `skill-quality-analyzer/` is untouched — it's functional and platform-agnostic Python
- `project-session-manager/` bash scripts are untouched — not skill content
