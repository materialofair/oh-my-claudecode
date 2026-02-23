---
name: code-review
description: Multi-layer AI code review with confidence scoring and MBTI personas
---

# Code Review Skill

Professional multi-layer code review combining parallel agent analysis, Gemini architecture review, Codex quality audit, and MBTI-driven synthesis.

## Language Configuration

**始终使用中文回复**: All review results will be presented in Chinese.

## When to Use

This skill activates when:
- User requests "review this code", "code review"
- Before merging a pull request
- After implementing a major feature
- User wants quality assessment

## Positioning

`code-review` supports two modes:
1. **Standard mode** (default): Fast multi-agent parallel review
2. **Deep mode** (`--deep`): Full 4-layer analysis with Gemini + Codex

## Quick Usage

```bash
# Standard review
/code-review                              # Review unstaged changes
/code-review --staged                     # Review staged changes
/code-review --diff HEAD~1..HEAD          # Review last commit

# Deep review (Multi-AI collaboration)
/code-review --deep                       # 4-layer deep analysis

# PR review
/code-review --pr [PR_NUMBER]             # Review specific PR
/code-review --pr --comment               # Post review as PR comment

# Quick review (small changes)
/code-review --quick                      # Single-pass fast review
```

## Enhanced Architecture

### Standard Mode: Multi-Agent Parallel Review

```
/code-review
    ↓
Step 1: Eligibility Check (Haiku Agent)
    - Check if review needed
    - Skip if: closed PR, draft, trivial change
    ↓
Step 2: Gather Context (Haiku Agent)
    - Find CLAUDE.md files (root + modified directories)
    - Get change summary
    ↓
Step 3: Parallel Review (5 Specialized Agents)
    ┌─────────────────────────────────────────────┐
    │ Agent #1 (INTJ): CLAUDE.md Compliance       │
    │ Agent #2 (ISTJ): Bug Detection (changes)    │
    │ Agent #3 (INTP): Git History Context         │
    │ Agent #4 (ENTP): Related PR Analysis         │
    │ Agent #5 (ISFJ): Code Comment Compliance     │
    └─────────────────────────────────────────────┘
    ↓
Step 4: Confidence Scoring (Parallel Haiku Agents)
    - Score each issue 0-100
    - Filter issues < 80 confidence
    ↓
Step 5: Generate Report (Main agent)
    - Format and present findings
    - Link to specific code lines
```

### Deep Mode: 4-Layer Sequential Analysis

```
/code-review --deep
    ↓
Layer 1: Parallel Multi-Agent Review (Step 1-4 above)
    ↓
Layer 2: Gemini Deep Analysis (via gemp CLI)
    - Architecture review (INTJ persona)
    - Security analysis
    - Performance implications
    ↓
Layer 3: Codex Quality Audit (via codex exec CLI)
    - Best practices (ISTJ persona)
    - Code maintainability
    - Pattern adherence
    ↓
Layer 4: Synthesis & MBTI Scoring
    - Combine all findings
    - Final confidence scoring
    - Comprehensive report
```

## Implementation

### Step 1: Parse Parameters & Eligibility Check

```markdown
Parse command arguments:
- MODE: "standard" | "deep" | "quick" | "pr"
- REVIEW_TARGET: File/directory path or diff range
- PR_NUMBER: Pull request number (if --pr)
- POST_COMMENT: true if --comment flag

If MODE == "pr":
  Launch Haiku agent to check:
  1. Is PR closed?
  2. Is PR draft?
  3. Is change trivial (< 10 lines, auto-generated)?
  If any is true → Exit with message
```

### Step 2: Gather Context

```markdown
Launch Haiku agent to:
1. Find CLAUDE.md files:
   - Root CLAUDE.md
   - CLAUDE.md in modified directories

2. Get change summary:
   - Files modified
   - Lines changed
   - Overall purpose

Return: {claude_md_files: [], summary: "", diff_content: ""}
```

### Step 3: Launch Parallel Review Agents

```markdown
If MODE == "quick":
  # Quick mode: Single-pass fast review via Gemini CLI (gemp)

  cat > /tmp/quick_review_prompt.txt << 'PROMPT_EOF'
  你是代码审查专家，快速审查以下变更:

  ```diff
  {diff_content}
  ```

  只报告:
  1. ❌ 明显错误 (语法、逻辑)
  2. ❌ 安全漏洞 (注入、XSS、敏感信息)
  3. ❌ 破坏性变更 (API 变更、向后兼容)

  如果没有严重问题，直接说 "✅ 无明显问题，可以合并"

  如果有问题，格式:
  ## ❌ 阻止合并
  **问题**: [简短描述]
  **位置**: `file:line`
  **修复**: [一句话建议]

  ## ✅ 合并建议
  - [ ] 可以合并
  - [ ] 修复后合并
  - [ ] 不建议合并
  PROMPT_EOF

  cat /tmp/quick_review_prompt.txt | node ~/.gemini/long_task_runner.js 2>&1

  Skip to Step 6 (Generate Report)

Else:
  Launch 5 parallel agents via Task tool:

Agent #1 - CLAUDE.md Compliance (INTJ 架构师):
  Task(
    subagent_type="oh-my-claudecode:style-reviewer",
    model="haiku",
    prompt="你是 INTJ 架构师，专注于规范合规性审查。

    CLAUDE.md 规范文件：
    {claude_md_files}

    代码变更：
    {diff_content}

    任务：检查代码是否违反 CLAUDE.md 中的明确指令。
    只标记明确违反的情况，避免泛泛的代码质量问题。

    输出格式：
    - 问题描述
    - 违反的 CLAUDE.md 指令（引用原文）
    - 建议修复方案
    - 初步置信度 (0-100)"
  )

Agent #2 - Bug Detection (ISTJ 工程师):
  Task(
    subagent_type="oh-my-claudecode:quality-reviewer",
    model="sonnet",
    prompt="你是 ISTJ 工程师，专注于 Bug 检测。

    代码变更：
    {diff_content}

    任务：浅层扫描变更部分的明显 bug。
    专注于大问题，忽略小细节和可能的误报。

    False Positive 规则（不要标记）：
    - 预存在的问题
    - linter/typechecker 会捕获的问题
    - 样式问题
    - 格式问题
    - 可能是有意的功能变更

    输出格式：
    - Bug 描述
    - 影响范围
    - 建议修复方案
    - 初步置信度 (0-100)"
  )

Agent #3 - Git History Analysis (INTP 性能极客):
  Task(
    subagent_type="oh-my-claudecode:quality-reviewer",
    model="haiku",
    prompt="你是 INTP 性能极客，专注于历史上下文分析。

    使用 git blame 查看修改代码的历史。
    检查：
    - 之前的 commit 是否揭示了问题
    - 修改是否与历史模式一致
    - 是否引入了回归问题

    输出格式：
    - 历史上下文发现
    - 潜在回归问题
    - 初步置信度 (0-100)"
  )

Agent #4 - Related PR Analysis (ENTP 创新者):
  Task(
    subagent_type="oh-my-claudecode:api-reviewer",
    model="haiku",
    prompt="你是 ENTP 创新者，专注于 PR 关联分析。

    查找之前修改相同文件的 PR。
    检查：
    - 之前 PR 的评论是否也适用于当前变更
    - 是否有重复的问题模式

    输出格式：
    - 相关 PR 发现
    - 适用的历史评论
    - 初步置信度 (0-100)"
  )

Agent #5 - Code Comment Compliance (ISFJ 维护者):
  Task(
    subagent_type="oh-my-claudecode:style-reviewer",
    model="haiku",
    prompt="你是 ISFJ 维护者，专注于代码注释合规性。

    读取修改文件中的代码注释。
    检查：
    - 代码变更是否遵循注释中的指导
    - 是否违反了 TODO/FIXME 注释
    - 是否忽略了重要的警告注释

    输出格式：
    - 注释合规性问题
    - 违反的具体注释
    - 初步置信度 (0-100)"
  )
```

### Step 4: Confidence Scoring & Filtering

```markdown
For each issue from Step 3, launch a parallel Haiku agent:

Task(
  subagent_type="oh-my-claudecode:quality-reviewer",
  model="haiku",
  prompt="你是专业的代码审查评分员。

  问题描述：{issue}
  代码变更：{diff_content}
  CLAUDE.md 文件：{claude_md_files}

  评分标准 (0-100)：
  - 0: 完全不确定，明显的误报
  - 25: 有点怀疑，可能是误报，未明确在 CLAUDE.md 中提到
  - 50: 中等确信，已验证是真实问题，但不是很重要
  - 75: 高度确信，双重检查过，会影响功能，或 CLAUDE.md 明确提到
  - 100: 绝对确定，确认是真实问题，经常发生

  False Positive 规则（降低分数）：
  - 预存在的问题
  - 看起来像 bug 但实际不是
  - 吹毛求疵的小问题
  - linter/typechecker 会捕获的问题
  - 缺少测试覆盖率（除非 CLAUDE.md 要求）
  - CLAUDE.md 提到但代码中明确忽略的问题
  - 可能是有意的功能变更
  - 真实问题，但在用户未修改的行上

  输出：最终置信度分数 (0-100)"
)

Filter: 只保留置信度 >= 80 的问题
```

### Step 5: Deep Mode Layers (Only when --deep)

```markdown
If MODE == "deep":

  Layer 2 - Gemini Architecture Analysis (INTJ):
    Via Gemini CLI (gemp, 优先; gemini --yolo 备用):

    cat > /tmp/gemini_arch_prompt.txt << 'PROMPT_EOF'
    你是 INTJ 架构师，进行深度架构分析。

    已发现的高置信度问题：
    {filtered_issues}

### Tool Usage
Before first MCP tool use, run the 3-step discovery: (1) `ToolSearch("mcp")`, (2) look for `mcp__x__ask_codex` in the results, (3) fall back to the `code-reviewer` Claude agent only if step 1 returns empty. Never use `ToolSearch("ask_codex")` as the primary search -- it can return false negatives even when MCP tools are present.
Use `mcp__x__ask_codex` with `agent_role: "code-reviewer"`.

    任务：
    1. 验证已发现的架构问题
    2. 识别额外的架构级别问题
    3. 评估安全性影响
    4. 分析性能影响

    输出：
    - 架构问题列表
    - 安全性评估
    - 性能影响
    - 总体架构评分 (1-10)
    PROMPT_EOF

    # 优先使用 gemp (支持长任务，20分钟超时)
    cat /tmp/gemini_arch_prompt.txt | node ~/.gemini/long_task_runner.js 2>&1

    # 备用: gemini CLI
    # cat /tmp/gemini_arch_prompt.txt | gemini --yolo 2>&1 | grep -v "STARTUP|YOLO|Load"

  Layer 3 - Codex Quality Audit (ISTJ):
    Via Codex CLI (codex exec):

    cat > /tmp/codex_quality_prompt.txt << 'PROMPT_EOF'
    你是 ISTJ 工程师，进行代码质量审计。

    已发现的高置信度问题：
    {filtered_issues}

    Gemini 的架构发现：
    {gemini_findings}

    代码变更：
    {diff_content}

    任务：
    1. 验证代码质量问题
    2. 检查最佳实践
    3. 评估可维护性
    4. 识别模式违规

    输出：
    - 代码质量问题列表
    - 最佳实践违规
    - 可维护性评估
    - 总体质量评分 (1-10)
    PROMPT_EOF

    cat /tmp/codex_quality_prompt.txt | codex exec --dangerously-bypass-approvals-and-sandbox - 2>&1

  Layer 4 - Synthesis & MBTI Analysis:
    Combine findings from all layers:
    - Layer 1 parallel agent results (filtered by confidence >= 80)
    - Layer 2 Gemini architecture findings
    - Layer 3 Codex quality findings
    Recalculate final confidence scores
    Map each finding to its MBTI persona source
    Generate comprehensive report
```

### Step 6: Generate Report

```markdown
Format based on mode:

If filtered_issues.length == 0:
  Output: |
    ## AI 审查报告
    **模式**: {MODE}
    **模型**: {models_used}

    未发现问题。已检查：
    - Bugs (ISTJ)
    - CLAUDE.md 合规性 (INTJ)
    - 历史上下文 (INTP)
    - 相关 PR (ENTP)
    - 代码注释合规性 (ISFJ)

Else:
  Output: |
    ## AI 审查报告
    **模式**: {MODE}
    **模型**: {models_used}
    **文件**: {files_count}个文件变更，+{lines_added}/-{lines_removed}行

    发现 {issues_count} 个高置信度问题：

    {for each issue}
    ### {severity} - {issue.title}

    **置信度**: {issue.confidence}/100
    **来源**: {issue.agent} ({issue.persona})
    **文件**: `{issue.file}:{issue.line}`

    {issue.description}

    **修复建议**:
    {issue.fix_suggestion}

    {end for}

    ---

    ## 总结
    - **总体评分**: {overall_score}/10
    - **严重问题**: {critical_count}个 (立即修复)
    - **高优先级问题**: {high_count}个 (本周修复)
    - **中等问题**: {medium_count}个 (本月修复)

    {if deep_mode}
    ### 深度分析
    **Gemini 架构评分**: {gemini_score}/10 (INTJ)
    {gemini_highlights}

    **Codex 质量评分**: {codex_score}/10 (ISTJ)
    {codex_highlights}
    {end if}

    ## 合并建议
    - [ ] ✅ 可以合并
    - [ ] ⚠️ 修复后合并
    - [ ] ❌ 不建议合并

    {if pr_mode && --comment}
    Post report via: gh pr comment {PR_NUMBER}
    {end if}
```

## MBTI Persona Mapping

| Agent Role | MBTI | Focus Area | Layer |
|-----------|------|------------|-------|
| CLAUDE.md Compliance | INTJ 架构师 | 规范遵守、系统设计 | 1 |
| Bug Detection | ISTJ 工程师 | 细节、逻辑错误 | 1 |
| Git History | INTP 性能极客 | 模式、历史上下文 | 1 |
| Related PR | ENTP 创新者 | 关联性、创新视角 | 1 |
| Code Comments | ISFJ 维护者 | 注释、文档一致性 | 1 |
| Gemini Architecture | INTJ 架构师 | 架构、安全、性能 | 2 |
| Codex Quality | ISTJ 工程师 | 最佳实践、可维护性 | 3 |

## Confidence Score Rubric

| Score | Meaning | Example |
|-------|---------|---------|
| 0 | 完全不确定 | 明显误报、预存在问题 |
| 25 | 有点怀疑 | 可能是问题，但未验证 |
| 50 | 中等确信 | 真实问题，但不重要 |
| 75 | 高度确信 | 影响功能，CLAUDE.md 明确提到 |
| 100 | 绝对确定 | 确认的真实问题，经常发生 |

**过滤阈值**: 80+ (只展示高度确信的问题)

## False Positive Rules

**不要标记以下情况** (降低置信度分数):

1. **预存在的问题** - 在变更前就存在
2. **工具可捕获** - linter、typechecker、compiler 会发现
3. **样式问题** - 格式、命名（除非 CLAUDE.md 明确要求）
4. **吹毛求疵** - 资深工程师不会提的小问题
5. **有意变更** - 功能变更可能是有意的
6. **未修改行** - 问题在用户未修改的代码行
7. **明确忽略** - CLAUDE.md 提到但代码中明确忽略（lint ignore）
8. **缺少测试** - 除非 CLAUDE.md 明确要求测试覆盖率

## Severity Rating

- **CRITICAL** - Security vulnerability (must fix before merge)
- **HIGH** - Bug or major code smell (should fix before merge)
- **MEDIUM** - Minor issue (fix when possible)
- **LOW** - Style/suggestion (consider fixing)

## Approval Criteria

**APPROVE** - No CRITICAL or HIGH issues, minor improvements only
**REQUEST CHANGES** - CRITICAL or HIGH issues present
**COMMENT** - Only LOW/MEDIUM issues, no blocking concerns

## Core Features

- ✅ Layer 1: 多 agent 并行审查 (5 agents with MBTI personas)
- ✅ Layer 2: Gemini 架构分析 (INTJ)
- ✅ Layer 3: Codex 质量审计 (ISTJ)
- ✅ Layer 4: 综合分析和 MBTI 人格映射
- ✅ 置信度评分系统 (0-100)
- ✅ False positive 过滤 (阈值 80)
- ✅ CLAUDE.md 合规性检查
- ✅ GitHub PR 集成
- ✅ Deep mode (多模型协作)
- ✅ 中文输出
- ✅ CLI 直接调用 Gemini/Codex (无 MCP 依赖)

## CLI Tool Requirements

Deep mode 需要以下 CLI 工具已安装并配置：
- **Gemini CLI**: `gemp` (alias for `node ~/.gemini/long_task_runner.js`) 或 `gemini --yolo`
- **Codex CLI**: `codex exec --dangerously-bypass-approvals-and-sandbox`
- **GitHub CLI**: `gh` (用于 PR 模式)

### CLI Implementation Templates

#### Gemini CLI (优先 gemp)
```bash
cat > /tmp/gemini_prompt.txt << 'PROMPT_EOF'
{persona} 你的审查任务...
PROMPT_EOF
cat /tmp/gemini_prompt.txt | node ~/.gemini/long_task_runner.js 2>&1
```

#### Gemini CLI (备用)
```bash
cat /tmp/gemini_prompt.txt | gemini --yolo 2>&1 | grep -v "STARTUP|YOLO|Load"
```

#### Codex CLI
```bash
cat > /tmp/codex_prompt.txt << 'PROMPT_EOF'
{persona} 你的审查任务...
PROMPT_EOF
cat /tmp/codex_prompt.txt | codex exec --dangerously-bypass-approvals-and-sandbox - 2>&1
```

## Use with Other Skills

**With Ralph:**
```
/ralph code-review --deep then fix all issues
```
Review code with full 4-layer analysis, fix until approved.

**With Ultrawork:**
```
/ultrawork code-review all files in src/
```
Parallel code review across multiple files.

**With Pipeline:**
```
/pipeline review "implement user authentication"
```
Includes code review as part of implementation workflow.
