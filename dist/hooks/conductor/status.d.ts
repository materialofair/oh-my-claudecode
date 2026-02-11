/**
 * Conductor Status Display
 *
 * Provides status reporting for conductor tracks and tasks.
 * Shows progress indicators and current state.
 */
/**
 * Display conductor status
 *
 * If no slug provided: shows all tracks with status indicators
 * If slug provided: shows detailed task-level progress for that track
 *
 * @param directory - Project root directory
 * @param slug - Optional track slug for detailed view
 * @param sessionId - Optional session ID
 * @returns Formatted status string
 */
export declare function displayStatus(directory: string, slug?: string, sessionId?: string): string;
//# sourceMappingURL=status.d.ts.map