/**
 * Conductor Revert
 *
 * Handles reverting a track by resetting git state back to the track's
 * start commit and updating track status.
 */
/**
 * Revert a track
 *
 * Shows files changed, confirms with user (currently just logs preview),
 * executes git reset, and updates track status to 'reverted'.
 *
 * @param directory - Project root directory
 * @param slug - Track slug
 * @param sessionId - Optional session ID
 * @param options - Revert options
 * @returns Revert results object
 */
export declare function revertTrack(directory: string, slug: string, sessionId?: string, options?: {
    /** Whether to use git reset --hard (default true) */
    hard?: boolean;
    /** Whether to skip confirmation (default false) */
    skipConfirmation?: boolean;
    /** Whether to delete the track branch (default true) */
    deleteBranch?: boolean;
}): Promise<{
    success: boolean;
    preview?: string;
    error?: string;
}>;
/**
 * Preview what would be reverted without executing
 *
 * @param directory - Project root directory
 * @param slug - Track slug
 * @param sessionId - Optional session ID
 * @returns Preview string
 */
export declare function previewRevert(directory: string, slug: string, sessionId?: string): {
    success: boolean;
    preview?: string;
    error?: string;
};
//# sourceMappingURL=revert.d.ts.map