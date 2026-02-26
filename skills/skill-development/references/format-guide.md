# Format Guide — OMC Skill Body Structure

Reference for the two body formats used in oh-my-claudecode skills.

---

## Format Selection

| Use case | Format |
|----------|--------|
| Workflow/process/orchestration skills (autopilot, ralph, plan, ultrawork) | XML tags |
| Utility/tool/management skills (note, trace, hud, skill) | Markdown headers |
| Domain skills with a clear protocol (tdd, security-review, ai-commenting) | Either — be consistent |

**Rule**: Pick one format per skill and don't mix them.

---

## XML Tag Format (Workflow Skills)

### Required tags

```xml
<Purpose>
What the skill does and what it produces. 2-4 sentences.
Answers: "What is this?" and "What do I get at the end?"
</Purpose>

<Use_When>
- Specific trigger conditions (be concrete, not vague)
- List exact phrases: User says "autopilot", "build me", "I want a..."
- List task types that warrant this skill
</Use_When>

<Do_Not_Use_When>
- Explicitly redirect to the right skill: "use `ralph` instead"
- List cases where users commonly misapply this skill
</Do_Not_Use_When>

<Why_This_Exists>
1-2 sentences explaining the problem this solves.
Prevents misuse by setting expectations.
</Why_This_Exists>

<Steps>
Ordered procedure. Each step should be a concrete action.
Include sub-steps where needed.
Reference agents with: Task(subagent_type="oh-my-claudecode:executor", ...)
</Steps>

<Examples>
<Good>
Concrete correct usage with explanation.
Why good: [specific reason]
</Good>

<Bad>
Common mistake with explanation.
Why bad: [specific reason]
</Bad>
</Examples>

<Final_Checklist>
- [ ] Checkboxes that verify completion
- [ ] Each item must be tool-verifiable or judgment-based (label which)
</Final_Checklist>
```

### Optional tags

```xml
<Execution_Policy>
Hard rules that override default behavior.
Use for: parallelism rules, model selection, iteration limits.
</Execution_Policy>

<Tool_Usage>
Which tools to use and when.
Required if the skill uses MCP tools (ToolSearch, ask_codex, ask_gemini).
</Tool_Usage>

<Escalation_And_Stop_Conditions>
When to stop and report vs. keep going.
Required for loop/persistence skills (ralph, ultrawork, ultraqa).
</Escalation_And_Stop_Conditions>

<Advanced>
Detail that's useful but not needed for basic execution.
This implements progressive disclosure — moved here from main body to keep it lean.
</Advanced>
```

### Anti-patterns in XML format

```xml
<!-- ❌ Vague Use_When -->
<Use_When>
- When the user needs help
- For complex tasks
</Use_When>

<!-- ✅ Specific Use_When -->
<Use_When>
- User says "autopilot", "build me", "I want a [project]"
- Task requires multiple phases: spec, code, test, validate
- User wants hands-off execution to completion
</Use_When>
```

---

## Markdown Header Format (Utility Skills)

```markdown
# Skill Name

One-sentence purpose statement.

## When to Use

Use this skill when:
- [specific scenario]
- [specific scenario]

## When NOT to Use

- [redirect]: use `other-skill` instead

## Workflow

1. [Step]
2. [Step]

## Examples

**Basic**:
"[example invocation]"

**Advanced**:
"[example invocation]"

## Notes / Limitations

- [caveat]
```

---

## Size Targets

| File | Target | Maximum |
|------|--------|---------|
| SKILL.md body | ≤150 lines | 200 lines |
| references/*.md | ≤250 lines | 400 lines |

If SKILL.md body exceeds 200 lines:
1. Identify the largest "reference-style" section (tables, long examples, advanced techniques)
2. Move it to `references/<topic>.md`
3. Add a pointer in SKILL.md: `See references/<topic>.md for detailed patterns.`

---

## Writing Style Rules

### Imperative form (required)

```
✅ "Start by reading the configuration file."
✅ "Validate the input before processing."
✅ "Use the Read tool to examine the skill content."

❌ "You should start by reading the configuration file."
❌ "You need to validate the input."
❌ "Claude should use the Read tool."
```

### Description (frontmatter) — third person

```yaml
✅ description: "This skill should be used when the user asks to 'create X', 'configure Y'."
✅ description: "Use when user wants to [scenario] ('[trigger 1]', '[trigger 2]')."

❌ description: Use this skill when you want to create X.
❌ description: Load when user needs help.
```

### No platform branding

Never include "Codex CLI", "Codex skill", or similar in body content — this is a Claude Code skill.

---

## Frontmatter Fields

```yaml
---
name: skill-name          # required; must match folder name exactly (kebab-case)
description: "..."        # required; must contain quoted trigger phrases
argument-hint: "<args>"   # optional; shown in skill listing
---
```

Only `name` and `description` are used by Claude for skill discovery and invocation. Additional fields are ignored at runtime.
