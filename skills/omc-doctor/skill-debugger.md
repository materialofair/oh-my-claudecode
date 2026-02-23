---
description: Debug why a Claude Code skill isn't triggering when expected
---

# Skill Debugger

[SKILL DEBUG MODE ACTIVATED]

## Objective

Systematically diagnose why a skill isn't triggering as expected. Identify root causes and provide actionable fixes.

## Debugging Workflow

### Step 1: Identify Target Skill

Ask the user which skill isn't working, or infer from context. Then verify it exists:

```bash
# Check plugin skills
ls ~/.claude/plugins/cache/omc/oh-my-claudecode/*/skills/<skill-name>/ 2>/dev/null

# Check global skills
ls ~/.claude/skills/<skill-name>/ 2>/dev/null
```

### Step 2: Validate SKILL.md

Use the `Read` tool to read the target skill's `SKILL.md` and check:

- [ ] File exists and is readable
- [ ] YAML frontmatter has `---` delimiters
- [ ] `name:` field matches folder name
- [ ] `description:` is 50-150 characters, specific, not vague
- [ ] No vague words ("helps", "assists", "various")

### Step 3: Analyze Description Quality

Compare the skill description against what the user asked. Check:

- Does the description contain keywords the user would naturally say?
- Is there a `<Use_When>` or "When to Use" section?
- Are there at least 3 usage examples?

### Step 4: Check for Conflicts

Scan all installed skills for overlapping descriptions:

```bash
# List all skill descriptions
for dir in ~/.claude/plugins/cache/omc/oh-my-claudecode/*/skills/*/; do
  if [ -f "$dir/SKILL.md" ]; then
    echo "=== $(basename $dir) ==="
    head -5 "$dir/SKILL.md"
    echo
  fi
done
```

Look for skills with similar keywords or overlapping use cases.

### Step 5: Check Command Registration

Verify if the skill has a corresponding slash command:

```bash
ls ~/.claude/plugins/cache/omc/oh-my-claudecode/*/commands/<skill-name>.md 2>/dev/null
```

If no command exists, the skill relies purely on semantic matching.

## Diagnosis Report Format

```
## Skill Debug Report

Skill: <name>
Path: <location>
Status: OK / NOT TRIGGERING / CONFLICT

### Issues Found
| Priority | Issue | Fix |
|----------|-------|-----|
| CRITICAL | ... | ... |
| HIGH | ... | ... |
| MEDIUM | ... | ... |

### Recommendations
1. [Specific fix with before/after examples]
2. [...]
```

## Common Fixes

| Problem | Fix |
|---------|-----|
| Description too vague | Add specific keywords and use cases |
| No trigger keywords | Add words users would naturally say |
| Wrong skill triggers | Differentiate descriptions between conflicting skills |
| Skill not found | Check installation path and folder name |
| No slash command | Create `commands/<name>.md` for explicit triggering |
