/**
 * Conductor Types
 *
 * Type definitions for the /conductor command - product-centered development workflow.
 *
 * The conductor feature orchestrates product-centered development through tracks:
 * 1. Spec: Product Manager creates feature specification
 * 2. Planning: Architect creates technical implementation plan
 * 3. Implementing: Executor builds the feature
 * 4. Reviewing: Quality Reviewer verifies implementation
 * 5. Complete: Feature is done and merged
 */
/**
 * Default configuration for conductor
 */
export const DEFAULT_CONDUCTOR_CONFIG = {
    autoCreateBranch: true,
    autoMerge: false,
    maxConcurrentTracks: 3,
    skipReview: false,
    agents: {
        spec: 'oh-my-claudecode:product-manager',
        planning: 'oh-my-claudecode:architect',
        implementing: 'oh-my-claudecode:executor',
        reviewing: 'oh-my-claudecode:quality-reviewer'
    }
};
//# sourceMappingURL=types.js.map