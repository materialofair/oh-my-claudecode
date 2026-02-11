/**
 * Conductor Prompt Templates
 *
 * Provides prompts for each phase of the conductor workflow:
 * - Spec: Product Manager creates feature specification
 * - Plan: Architect creates implementation plan
 * - Implement: Executor builds specific tasks
 * - Review: Quality Reviewer verifies implementation
 */
// ============================================================================
// CONTEXT FORMATTING
// ============================================================================
/**
 * Format conductor context into a readable string for prompts
 */
export function formatContextForPrompt(context) {
    const parts = [];
    if (context.productDefinition) {
        parts.push(`**Product Definition:** ${context.productDefinition}`);
    }
    if (context.techStackPath) {
        parts.push(`**Tech Stack:** ${context.techStackPath}`);
    }
    if (context.workflowPath) {
        parts.push(`**Workflow Guide:** ${context.workflowPath}`);
    }
    if (context.styleguides.length > 0) {
        parts.push(`**Style Guides:**\n${context.styleguides.map(s => `  - ${s}`).join('\n')}`);
    }
    if (context.bootstrappedFromProjectMemory) {
        parts.push(`**Note:** Context was bootstrapped from project memory.`);
    }
    if (parts.length === 0) {
        return 'No project context available.';
    }
    return parts.join('\n\n');
}
// ============================================================================
// SPEC PROMPT
// ============================================================================
/**
 * Generate prompt for analyst/product-manager to create feature specification
 */
export function getSpecPrompt(context, trackDescription) {
    return `You are acting as a Product Manager creating a feature specification.

## Track Description
${trackDescription}

## Project Context
${context}

## Your Task
Create a comprehensive feature specification that includes:

1. **Overview**
   - Brief summary of the feature
   - Problem being solved
   - Target users/personas

2. **Requirements**
   - Functional requirements (what the feature must do)
   - Non-functional requirements (performance, security, etc.)
   - User stories or use cases

3. **Acceptance Criteria**
   - Specific, testable criteria for completion
   - Success metrics
   - Edge cases to handle

4. **Dependencies**
   - Required libraries or services
   - Prerequisites or blockers
   - Integration points with existing features

5. **Out of Scope**
   - What this feature explicitly does NOT include
   - Future enhancements (if any)

Write the specification in markdown format. Be detailed and specific.`;
}
// ============================================================================
// PLAN PROMPT
// ============================================================================
/**
 * Generate prompt for architect/planner to create implementation plan
 */
export function getPlanPrompt(context, spec) {
    return `You are acting as a Software Architect creating an implementation plan.

## Project Context
${context}

## Feature Specification
${spec}

## Your Task
Create a detailed implementation plan that includes:

1. **Overview**
   - High-level approach
   - Key architectural decisions
   - Implementation strategy

2. **Architecture**
   - Component structure
   - Data flow
   - API contracts (if applicable)
   - File/module organization

3. **Tasks**
   Format as a numbered list under "## Tasks" heading:
   1. First task description
   2. Second task description
   3. Third task description

   Each task should be:
   - Clear and actionable
   - Reasonably sized (1-3 hours of work)
   - Ordered by dependency (earlier tasks should not depend on later ones)

4. **Technical Considerations**
   - Performance implications
   - Security considerations
   - Error handling strategy
   - Backwards compatibility

5. **Testing Strategy**
   - Unit tests needed
   - Integration tests needed
   - Manual testing steps
   - Edge cases to verify

Write the plan in markdown format. Be specific about file names, function signatures, and data structures where possible.`;
}
// ============================================================================
// IMPLEMENT TASK PROMPT
// ============================================================================
/**
 * Generate prompt for executor to implement a specific task
 */
export function getImplementTaskPrompt(context, spec, plan, task) {
    return `You are acting as a Software Engineer implementing a specific task.

## Project Context
${context}

## Feature Specification
${spec}

## Implementation Plan
${plan}

## Your Task
**Task ID:** ${task.id}
**Description:** ${task.description}

## Instructions
1. Implement the task as described
2. Follow the technical approach outlined in the plan
3. Write clean, maintainable code
4. Add appropriate error handling
5. Include comments where logic is non-obvious
6. Ensure code follows project conventions

After implementation:
- List all files you modified or created
- Verify the code compiles/runs without errors
- Run relevant tests if they exist
- Note any deviations from the plan (if necessary)

Focus ONLY on this specific task. Do not implement other tasks or make unrelated changes.`;
}
// ============================================================================
// REVIEW PROMPT
// ============================================================================
/**
 * Generate prompt for quality reviewer to verify implementation
 */
export function getReviewPrompt(context, spec, plan, diff) {
    return `You are acting as a Quality Reviewer verifying feature implementation.

## Project Context
${context}

## Feature Specification
${spec}

## Implementation Plan
${plan}

## Changes Made
\`\`\`diff
${diff}
\`\`\`

## Your Task
Review the implementation and provide a comprehensive quality assessment:

1. **Completeness**
   - Are all requirements from the spec implemented?
   - Are all tasks from the plan completed?
   - Are there any missing edge cases?

2. **Code Quality**
   - Is the code clean and maintainable?
   - Are naming conventions followed?
   - Is error handling appropriate?
   - Are there any code smells or anti-patterns?

3. **Architecture**
   - Does the implementation follow the planned architecture?
   - Are components properly organized?
   - Are abstractions appropriate?

4. **Testing**
   - Are there adequate tests?
   - Do tests cover edge cases?
   - Are manual testing steps needed?

5. **Security**
   - Are there any security vulnerabilities?
   - Is input validation present where needed?
   - Are authentication/authorization handled correctly?

6. **Performance**
   - Are there any obvious performance issues?
   - Are resources cleaned up properly?
   - Are there unnecessary operations?

## Review Format
Provide your review in this format:

### Summary
[Brief 2-3 sentence summary of the implementation]

### Strengths
- [What was done well]

### Issues Found
- **Critical:** [Issues that must be fixed]
- **Major:** [Issues that should be fixed]
- **Minor:** [Issues that could be improved]

### Recommendation
- [ ] APPROVE: Implementation is ready to merge
- [ ] APPROVE WITH MINOR CHANGES: Implementation is good but has minor issues
- [ ] REQUEST CHANGES: Implementation has issues that must be addressed

### Next Steps
[Specific actions needed, if any]

Be thorough but constructive in your review.`;
}
// ============================================================================
// ADDITIONAL PROMPTS
// ============================================================================
/**
 * Generate prompt for critic to review the plan
 */
export function getCriticPrompt(context, spec, plan) {
    return `You are acting as a Critical Reviewer evaluating an implementation plan.

## Project Context
${context}

## Feature Specification
${spec}

## Proposed Implementation Plan
${plan}

## Your Task
Critically evaluate the implementation plan and identify:

1. **Risks and Issues**
   - What could go wrong with this approach?
   - Are there missing tasks or considerations?
   - Are tasks ordered correctly?

2. **Alternative Approaches**
   - Is there a simpler way to achieve the same goal?
   - Are there better architectural choices?
   - What are the tradeoffs?

3. **Gaps and Omissions**
   - What's missing from the plan?
   - Are there unstated assumptions?
   - Are dependencies clearly identified?

4. **Recommendations**
   - What should be changed or added?
   - What needs more detail?
   - What concerns need to be addressed?

Be constructive but thorough in your critique. The goal is to improve the plan before implementation begins.`;
}
/**
 * Generate prompt for setup/context initialization
 */
export function getSetupPrompt() {
    return `You are initializing conductor, a product-centered development workflow system.

## Your Task
Set up the conductor environment by identifying key project documentation:

1. **Product Definition**
   - Look for files like: README.md, PRODUCT.md, docs/product/*
   - Should contain: product vision, target users, key features

2. **Tech Stack Documentation**
   - Look for files like: TECH_STACK.md, docs/architecture/*, package.json
   - Should contain: languages, frameworks, libraries, tools

3. **Workflow Guide**
   - Look for files like: CONTRIBUTING.md, DEVELOPMENT.md, docs/workflow/*
   - Should contain: development process, code review, testing

4. **Style Guides**
   - Look for files like: STYLE_GUIDE.md, .eslintrc, .prettierrc
   - Should contain: code conventions, naming patterns, formatting

## Instructions
1. Search for these files in the project
2. Report which files you found and their paths
3. If files don't exist, recommend creating them
4. Store the paths in conductor context for future reference

The goal is to gather all relevant context so agents have clear guidance during feature development.`;
}
//# sourceMappingURL=prompts.js.map