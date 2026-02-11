/**
 * Conductor Prompt Templates
 *
 * Provides prompts for each phase of the conductor workflow:
 * - Spec: Product Manager creates feature specification
 * - Plan: Architect creates implementation plan
 * - Implement: Executor builds specific tasks
 * - Review: Quality Reviewer verifies implementation
 */
import type { ConductorContext, TrackTask } from './types.js';
/**
 * Format conductor context into a readable string for prompts
 */
export declare function formatContextForPrompt(context: ConductorContext): string;
/**
 * Generate prompt for analyst/product-manager to create feature specification
 */
export declare function getSpecPrompt(context: string, trackDescription: string): string;
/**
 * Generate prompt for architect/planner to create implementation plan
 */
export declare function getPlanPrompt(context: string, spec: string): string;
/**
 * Generate prompt for executor to implement a specific task
 */
export declare function getImplementTaskPrompt(context: string, spec: string, plan: string, task: TrackTask): string;
/**
 * Generate prompt for quality reviewer to verify implementation
 */
export declare function getReviewPrompt(context: string, spec: string, plan: string, diff: string): string;
/**
 * Generate prompt for critic to review the plan
 */
export declare function getCriticPrompt(context: string, spec: string, plan: string): string;
/**
 * Generate prompt for setup/context initialization
 */
export declare function getSetupPrompt(): string;
//# sourceMappingURL=prompts.d.ts.map