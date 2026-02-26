---
name: skill-development
description: This skill should be used when the user wants to "create a skill", "write a new skill", "add a skill", or "improve an existing skill". Covers structure, description quality, progressive disclosure, and the quality pipeline.
---

# Writing Skills for Claude Code (OMC)

Guide for creating effective skills in the oh-my-claudecode (OMC) environment. Skills are modular `.claude/skills/<name>/SKILL.md` files that teach Claude specialized workflows, domain knowledge, and tool integrations.

## Agent Workflow

Follow this **Hybrid Workflow** for every skill creation or improvement task:

1. **Requirement Gathering (Soft)**: Before writing anything, ask for **concrete trigger examples**.
   - *Agent Question*: "Give me 3 exact phrases a user would say to trigger this skill."
   - These become the quoted trigger phrases in the description.
2. **Structural Planning (Hard)**: Decide the file structure based on complexity.
   - Simple knowledge or utility → just `SKILL.md`
   - Workflow with detailed reference content → `SKILL.md` + `references/`
   - Script-heavy → add `scripts/`
3. **Implementation**: Write with correct YAML frontmatter and consistent body format.

## Integration with the OMC Skill Pipeline

This skill is the **entry point**. After creating or editing a skill, run:

1. `skill-development` — create/author the skill (this skill)
2. `skill-quality-analyzer` — score it across 6 dimensions (target ≥80)
3. `skill-debugger` — check if description triggers correctly
4. `skill-tester` — verify behavioral correctness

## Anatomy of an OMC Skill

```
skill-name/               ← folder name = YAML name (kebab-case)
├── SKILL.md              ← required; ≤200 lines ideally
└── references/           ← optional; detailed content loaded on demand
    ├── patterns.md
    └── examples.md
```

### SKILL.md (required)

**Frontmatter**: The `description` field is what Claude sees in the system-reminder when deciding whether to invoke the skill. Make it specific.

Two formats for the description:

```yaml
# For skills intended for auto-discovery (user/project skills):
description: "This skill should be used when the user asks to 'trigger phrase 1', 'trigger phrase 2', 'trigger phrase 3'."

# For OMC core workflow skills (already triggered by CLAUDE.md keywords):
description: "Concise capability summary. Triggered by: 'keyword1', 'keyword2'."
```

**Body formats** — choose one and be consistent:

- **XML tags** (for workflow/process skills): `<Purpose>`, `<Use_When>`, `<Do_Not_Use_When>`, `<Steps>`, `<Examples>`, `<Final_Checklist>`, `<Advanced>`
- **Markdown headers** (for utility/reference skills): `## When to Use`, `## Workflow`, `## Examples`

See `references/format-guide.md` for complete tag-by-tag reference.

### references/ (optional)

Load only when Claude determines it's needed during execution.

- **When to use**: SKILL.md body would exceed ~200 lines without it
- **Move here**: detailed patterns, API references, advanced techniques, long examples
- **Keep in SKILL.md**: core workflow, quick reference tables, pointers to references/

### Progressive Disclosure

Skills use a three-level loading system:

| Level | What loads | When |
|-------|-----------|------|
| Metadata | `name` + `description` | Always |
| Body | SKILL.md content | When skill triggers |
| References | `references/*.md` | When Claude reads them |

## Skill Creation Process

### Step 1: Understand the Use Case

Skip only when usage patterns are completely clear.

Ask for concrete examples:
- "What would a user say to trigger this skill?"
- "What's the main output or artifact it produces?"
- "What should it NOT do?" (defines `<Do_Not_Use_When>`)

Aim for 3 trigger phrases before writing any content.

### Step 2: Plan the Structure

Analyze each concrete example:
1. What would Claude need to execute this from scratch?
2. What reference material would help if repeated?
3. Any scripts or assets needed?

### Step 3: Write the Description

**Hard rule**: The description must contain quoted trigger phrases.

```yaml
# ✅ Good — specific trigger phrases, third person, summary at end
description: "This skill should be used when the user asks to 'create a validation rule', 'define trigger conditions', or 'validate tool instructions'. Provides comprehensive guidance with clear trigger phases and quality gates."

# ❌ Bad — vague, no trigger phrases, wrong person
description: Use this skill when working with hooks.
description: Provides hook guidance.
```

### Step 4: Write the Body

**Style**: Imperative/infinitive form, not second person.

```
✅ "Start by reading the configuration file."
✅ "Validate the input before processing."
❌ "You should start by reading the configuration file."
❌ "You need to validate the input."
```

**Size target**: ≤200 lines for SKILL.md body. Move detail to `references/` if exceeded.

### Step 5: Validate

Run `skill-quality-analyzer` on the new skill. Target score ≥80.

Check the description manually:
```bash
grep "^description:" skills/<name>/SKILL.md
# Verify it contains quoted trigger phrases
```

Check line count:
```bash
wc -l skills/<name>/SKILL.md
# Target: ≤200
```

### Step 6: Iterate

After using the skill on real tasks:
- Notice struggles or missed triggers
- Strengthen description with additional trigger phrases
- Move long sections to `references/` if context bloat is observed
- Add missing edge cases to `<Do_Not_Use_When>`

## Validation Checklist

**Frontmatter:**
- [ ] `name` matches folder name exactly (kebab-case)
- [ ] `description` contains at least 2 quoted trigger phrases
- [ ] Description is ≤200 characters

**Content:**
- [ ] Body uses imperative form (not "you should")
- [ ] SKILL.md ≤200 lines (move detail to references/ if not)
- [ ] Referenced files in `references/` actually exist
- [ ] No platform-specific branding (e.g., "Codex CLI")

**Quality:**
- [ ] `skill-quality-analyzer` score ≥80
- [ ] `<Do_Not_Use_When>` or equivalent section present (prevents misuse)
- [ ] At least 3 usage examples (Good + Bad preferred)

## Common Mistakes

### Mistake 1: Weak trigger description

```yaml
# ❌ Bad
description: Provides guidance for working with hooks.

# ✅ Good
description: "This skill should be used when the user asks to 'create a hook', 'add a pre-tool hook', or 'set up hook validation'. Full hook development guide with examples and scripts."
```

### Mistake 2: Everything in SKILL.md

```
# ❌ Bad
skill-name/
└── SKILL.md  (900 lines — everything in one file)

# ✅ Good
skill-name/
├── SKILL.md         (180 lines — core workflow)
└── references/
    ├── patterns.md  (250 lines)
    └── advanced.md  (300 lines)
```

### Mistake 3: Second-person writing

```
# ❌ Bad
You should start by reading the config file.
You need to validate the input.

# ✅ Good
Start by reading the config file.
Validate the input before processing.
```

## Additional Resources

- `references/format-guide.md` — complete XML tag reference, style rules, size targets
- `references/description-patterns.md` — Good/Bad description catalog for all OMC skill categories

## Related Skills

- `skill-quality-analyzer` — score a skill across 6 quality dimensions
- `skill-debugger` — debug why a skill isn't triggering
- `skill-tester` — verify a skill triggers and behaves correctly
- `skill` — manage installed skills (list, add, remove, sync)
