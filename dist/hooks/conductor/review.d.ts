/**
 * Conductor Review
 *
 * Handles track review by computing git diffs and delegating to
 * code-reviewer and security-reviewer agents.
 */
/**
 * Review a track
 *
 * Computes git diff from gitStartCommit to HEAD, loads context/spec/plan,
 * delegates to code-reviewer and security-reviewer agents, and writes
 * review.md to the track directory.
 *
 * @param directory - Project root directory
 * @param slug - Track slug
 * @param sessionId - Optional session ID
 * @returns Review results object
 */
export declare function reviewTrack(directory: string, slug: string, sessionId?: string): Promise<{
    success: boolean;
    reviewPath?: string;
    error?: string;
}>;
//# sourceMappingURL=review.d.ts.map