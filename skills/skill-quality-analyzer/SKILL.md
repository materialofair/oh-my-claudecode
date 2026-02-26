---
name: skill-quality-analyzer
description: Analyzes Claude Code skill quality with 6-dimension scoring system, providing actionable improvement recommendations for descriptions, structure, examples, and triggers.
---

# Skill Quality Analyzer

Comprehensive quality analysis system for Claude Code skills using a 6-dimension scoring framework. Identifies quality issues, provides improvement recommendations, and generates detailed quality reports.

## Agent Workflow

To perform a high-quality analysis, follow this **Hybrid Workflow**:

1.  **Hard Metrics (tools)**: Use `Glob` and `Read` tools to gather objective facts about the **target skill**.
    - Does `SKILL.md` exist? Check with `Glob("skills/<name>/SKILL.md")`
    - Does the description contain quoted trigger phrases? Check with `Read` on the frontmatter
    - Are referenced `references/` files present? Verify each exists
    - If `analyzer.py` is present in this skill's directory, run it: `python3 skills/skill-quality-analyzer/analyzer.py --skill-path [TARGET_SKILL_PATH]`
2.  **Soft Metrics (judgment)**: Use `Read` to read the target skill's `SKILL.md` content and assess semantics.
    *Do not read this analyzer skill's own files — read only the skill being analyzed.*
    - *Script says*: "Description too short." → *You check*: "Is it just short, or actually nonsense?"
    - *Script says*: "100/100 score." → *You check*: "Format is perfect, but does the logic make sense?"
3.  **Synthesize Report**: Combine hard metrics + soft judgment into a severity-ranked report.

## Capabilities

- **6-Dimension Quality Scoring**: Evaluates skills across Clarity, Structure, Examples, Trigger Detection, Best Practices, and Maintainability (0-100 scale)
- **Automated Issue Detection**: Identifies common problems like missing examples, unclear descriptions, poor structure, and missing trigger words
- **Improvement Recommendations**: Provides specific, actionable suggestions for each quality dimension
- **Comparative Analysis**: Compares skills against best practices from official Antigravity examples
- **Quality Report Generation**: Creates detailed markdown reports with scores, issues, and recommendations
- **Batch Analysis**: Analyzes multiple skills at once for consistency checking

## Input Requirements

**Single Skill Analysis**:
- Skill folder path (e.g., `~/.claude/skills/my-skill/` or `skills/my-skill/`)
- Or SKILL.md file path directly

**Batch Analysis**:
- Directory containing multiple skills
- Or list of skill paths

**Data Requirements**:
- Valid SKILL.md file with YAML frontmatter
- Optional: Python files, README.md, HOW_TO_USE.md

## Output Formats

**Quality Score Card** (JSON):
```json
{
  "overall_score": 85,
  "dimensions": {
    "clarity": {"score": 90, "weight": 20},
    "structure": {"score": 85, "weight": 20},
    "examples": {"score": 80, "weight": 15},
    "trigger_detection": {"score": 90, "weight": 15},
    "best_practices": {"score": 80, "weight": 15},
    "maintainability": {"score": 85, "weight": 15}
  },
  "issues": ["Missing usage examples", "No sample inputs"],
  "recommendations": ["Add 3-5 concrete usage examples", "Include sample_input.json"]
}
```

**Quality Report** (Markdown):
- Executive summary with overall score
- Dimension-by-dimension breakdown
- Critical issues list (severity-ranked)
- Improvement recommendations (prioritized)
- Comparison with best practices
- Before/After improvement potential

## Six Quality Dimensions

### 1. Clarity (20%)
- **What it measures**: How clearly the skill's purpose, capabilities, and usage are communicated
- **Key indicators**:
  - Description specificity (not vague)
  - Clear capability statements
  - Unambiguous usage instructions
  - No jargon without explanation
- **Scoring**:
  - 90-100: Crystal clear, no ambiguity
  - 70-89: Mostly clear, minor improvements needed
  - 50-69: Some confusion possible
  - <50: Unclear purpose or usage

### 2. Structure (20%)
- **What it measures**: Organizational quality and consistency with Anthropic standards
- **Key indicators**:
  - Valid YAML frontmatter (name in kebab-case, concise description)
  - Required sections present (Capabilities, Input/Output, How to Use)
  - Logical section ordering
  - Proper markdown formatting
- **Scoring**:
  - 90-100: Perfect structure, all sections present
  - 70-89: Minor structural issues
  - 50-69: Missing key sections
  - <50: Severely malformed

### 3. Examples (15%)
- **What it measures**: Quality and quantity of usage examples
- **Key indicators**:
  - 3-5 concrete usage examples
  - sample_input.json present
  - expected_output.json present
  - Examples cover major use cases
- **Scoring**:
  - 90-100: Rich examples with sample data
  - 70-89: Good examples, missing sample files
  - 50-69: Minimal examples
  - <50: No examples or sample data

### 4. Trigger Detection (15%)
- **What it measures**: How easily Claude can determine when to invoke this skill
- **Key indicators**:
  - Clear "When to use" section
  - Specific trigger keywords identified
  - Description mentions use cases
  - No overlap with existing skills
- **Scoring**:
  - 90-100: Crystal clear triggers
  - 70-89: Mostly clear when to use
  - 50-69: Ambiguous triggering conditions
  - <50: No clear triggers

### 5. Best Practices (15%)
- **What it measures**: Adherence to Claude Code skill development standards
- **Key indicators**:
  - Follows Claude Code naming conventions (kebab-case folder = YAML name)
  - Proper Python structure (if applicable)
  - No backup files or `__pycache__`
  - Proper file organization (SKILL.md + optional references/, scripts/)
  - No platform-specific branding (e.g., "Codex" in a Claude Code skill)
- **Scoring**:
  - 90-100: Exemplary adherence
  - 70-89: Minor deviations
  - 50-69: Several best practice violations
  - <50: Major violations

### 6. Maintainability (15%)
- **What it measures**: How easy it is to update and maintain the skill
- **Key indicators**:
  - Clear code comments (if Python files)
  - Modular design
  - No hard-coded values
  - Version information present
  - Clean file structure (no clutter)
- **Scoring**:
  - 90-100: Highly maintainable
  - 70-89: Generally maintainable
  - 50-69: Some maintenance challenges
  - <50: Difficult to maintain

## How to Use

**Basic Analysis**:
```
"Analyze the quality of my skill-development skill"
"What's the quality score for ~/.claude/skills/code-review/"
"Run quality analysis on the skill-debugger skill"
```

**Detailed Report**:
```
"Generate a detailed quality report for skill-debugger"
"Analyze skills/skill-development/ and create improvement recommendations"
```

**Batch Analysis**:
```
"Analyze all skills in skills/ and rank them by quality"
"Compare quality scores across all my custom skills"
```

**Comparative Analysis**:
```
"Compare my code-review skill against best practices"
"How does skill-tester compare to the skill-development skill in quality?"
```

## Scripts

- `analyzer.py`: Core 6-dimension quality analysis engine
  - Usage: `python3 skills/skill-quality-analyzer/analyzer.py --skill-path /path/to/skill`
  - Run this as the **Hard Metrics** step before manual review
- `validator.py`: YAML frontmatter and structure validation (merged into analyzer.py)
- `best_practices_checker.py`: Checks adherence to Claude Code standards (merged into analyzer.py)

## Best Practices

1. **Run Before Distribution**: Always analyze skills before sharing or installing
2. **Target 80+ Score**: Aim for overall scores of 80 or higher for production skills
3. **Fix Critical Issues First**: Address issues flagged as "Critical" or "High" severity
4. **Iterate**: Re-analyze after improvements to track progress
5. **Batch Analysis for Consistency**: Use batch mode to ensure consistent quality across all your skills
6. **Compare Against Examples**: Use comparative analysis to learn from official skills

## Integration with Skill Pipeline

**With skill-development**: Use after creating a new skill to validate it meets the standard before shipping.

**With skill-debugger**: Run quality-analyzer first (structural issues), then skill-debugger (trigger issues).

**With skill-tester**: Quality-analyzer checks static quality; skill-tester validates behavioral correctness.

**Recommended pipeline**: `skill-development` → `skill-quality-analyzer` → `skill-debugger` → `skill-tester`

## Limitations

- **Static Analysis Only**: Does not test skill execution or effectiveness
- **No Runtime Testing**: Cannot verify if Python code works correctly
- **Pattern-Based**: Relies on known patterns and best practices
- **English-Focused**: May not handle non-English skills as effectively
- **No Context Understanding**: Cannot judge if a skill's purpose is valuable
- **File-Based**: Requires access to skill files (cannot analyze from description alone)

## When NOT to Use This Skill

- **Testing trigger behavior**: Use skill-debugger instead (why isn't it triggering?)
- **Verifying behavioral correctness**: Use skill-tester instead (does it produce the right output?)
- **Creating a new skill**: Use skill-development first, then analyze

## Quality Thresholds

| Score Range | Quality Level | Action |
|-------------|---------------|--------|
| 90-100 | Excellent | Ready for production, share as example |
| 80-89 | Good | Minor improvements, safe to deploy |
| 70-79 | Acceptable | Address key issues before wide distribution |
| 60-69 | Needs Work | Significant improvements required |
| <60 | Poor | Major refactoring needed |

## Comparison with CodeDNA

| Dimension | CodeDNA (Code) | Skill Quality Analyzer (Skills) |
|-----------|----------------|----------------------------------|
| Clarity | Comments & naming | Description & documentation |
| Structure | Code organization | Section organization & YAML |
| Examples | Test coverage | Usage examples & sample data |
| Patterns | Design patterns | Trigger detection |
| Standards | Coding standards | Claude Code best practices |
| Maintenance | Cyclomatic complexity | File cleanliness & modularity |
