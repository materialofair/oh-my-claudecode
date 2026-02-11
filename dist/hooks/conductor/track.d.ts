/**
 * Conductor Track Creation and Management
 *
 * Handles:
 * - Creating new tracks with spec/plan/implement workflow
 * - Delegating to specialized agents (analyst, planner, executor)
 * - Parsing plan.md into TrackTask array
 * - Recording git state for tracking changes
 */
import type { Track } from './types.js';
/**
 * Create a new track and return the start instruction
 *
 * @param directory - Working directory
 * @param title - Track title
 * @param description - Track description
 * @param sessionId - Session ID
 * @param createBranch - Whether to create git branch
 * @returns Object containing the created track and the instruction to start the analyst
 */
export declare function createNewTrack(directory: string, title: string, description: string, sessionId?: string, createBranch?: boolean): Promise<{
    track: Track;
    instruction: string;
}>;
/**
 * Proceed to planning phase for an existing track
 */
export declare function proceedToPlanning(directory: string, slug: string, sessionId?: string): Promise<{
    track: Track;
    instruction: string;
}>;
/**
 * Review a track implementation
 */
export declare function reviewTrack(directory: string, slug: string, sessionId?: string): Promise<{
    track: Track;
    instruction: string;
}>;
/**
 * Load an existing track by slug
 */
export declare function loadTrack(directory: string, slug: string, sessionId?: string): Track | null;
/**
 * Get the spec content for a track
 */
export declare function getSpecContent(directory: string, slug: string): string | null;
/**
 * Get the plan content for a track
 */
export declare function getPlanContent(directory: string, slug: string): string | null;
//# sourceMappingURL=track.d.ts.map