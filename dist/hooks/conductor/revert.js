/**
 * Conductor Revert
 *
 * Handles reverting a track by resetting git state back to the track's
 * start commit and updating track status.
 */
import { execSync } from 'child_process';
import { getTrack, updateTrack } from './state.js';
/**
 * Get list of files changed in a track
 *
 * @param directory - Project root directory
 * @param gitStartCommit - Starting commit hash
 * @returns Array of changed file paths
 */
function getChangedFiles(directory, gitStartCommit) {
    try {
        const output = execSync(`git diff --name-only ${gitStartCommit}..HEAD`, { cwd: directory, encoding: 'utf-8' });
        return output.trim().split('\n').filter(line => line.length > 0);
    }
    catch (error) {
        throw new Error(`Failed to get changed files: ${error.message}`);
    }
}
/**
 * Get git status to check for uncommitted changes
 *
 * @param directory - Project root directory
 * @returns true if working directory is clean
 */
function isWorkingDirectoryClean(directory) {
    try {
        const output = execSync('git status --porcelain', { cwd: directory, encoding: 'utf-8' });
        return output.trim().length === 0;
    }
    catch {
        return false;
    }
}
/**
 * Execute git reset to revert changes
 *
 * @param directory - Project root directory
 * @param gitStartCommit - Commit to reset to
 * @param hard - Whether to use --hard (discard changes) or --soft (keep changes staged)
 */
function executeGitReset(directory, gitStartCommit, hard = true) {
    const resetMode = hard ? '--hard' : '--soft';
    try {
        execSync(`git reset ${resetMode} ${gitStartCommit}`, { cwd: directory, encoding: 'utf-8' });
    }
    catch (error) {
        throw new Error(`Git reset failed: ${error.message}`);
    }
}
/**
 * Get current git branch
 *
 * @param directory - Project root directory
 * @returns Current branch name
 */
function getCurrentBranch(directory) {
    try {
        const output = execSync('git rev-parse --abbrev-ref HEAD', { cwd: directory, encoding: 'utf-8' });
        return output.trim();
    }
    catch (error) {
        throw new Error(`Failed to get current branch: ${error.message}`);
    }
}
/**
 * Delete a git branch
 *
 * @param directory - Project root directory
 * @param branch - Branch name to delete
 * @param force - Whether to force delete (use -D instead of -d)
 */
function deleteBranch(directory, branch, force = true) {
    const deleteFlag = force ? '-D' : '-d';
    try {
        execSync(`git branch ${deleteFlag} ${branch}`, { cwd: directory, encoding: 'utf-8' });
    }
    catch (error) {
        // Branch might not exist or might be current branch - log but don't fail
        console.warn(`Could not delete branch ${branch}: ${error.message}`);
    }
}
/**
 * Format revert preview
 *
 * @param track - Track being reverted
 * @param changedFiles - Files that will be affected
 * @returns Formatted preview string
 */
function formatRevertPreview(track, changedFiles) {
    const lines = [];
    lines.push(`Revert Preview: ${track.title}`);
    lines.push('='.repeat(50));
    lines.push('');
    lines.push(`Track: ${track.slug}`);
    lines.push(`Status: ${track.status}`);
    lines.push(`Branch: ${track.gitBranch || 'N/A'}`);
    lines.push(`Start Commit: ${track.gitStartCommit?.substring(0, 8)}`);
    lines.push('');
    lines.push('The following files will be reverted:');
    lines.push('');
    changedFiles.forEach(file => {
        lines.push(`  - ${file}`);
    });
    lines.push('');
    lines.push('WARNING: This will discard all changes made in this track.');
    lines.push('This operation cannot be undone unless changes are committed.');
    return lines.join('\n');
}
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
export async function revertTrack(directory, slug, sessionId, options) {
    const { hard = true, skipConfirmation = false, deleteBranch: shouldDeleteBranch = true } = options || {};
    try {
        // Load track
        const track = getTrack(directory, slug, sessionId);
        if (!track) {
            return { success: false, error: `Track "${slug}" not found.` };
        }
        // Verify track has a git start commit
        if (!track.gitStartCommit) {
            return {
                success: false,
                error: 'Track has no git start commit. Cannot revert.'
            };
        }
        // Check if working directory is clean
        if (!isWorkingDirectoryClean(directory) && hard) {
            return {
                success: false,
                error: 'Working directory has uncommitted changes. Commit or stash them first.'
            };
        }
        // Get changed files for preview
        const changedFiles = getChangedFiles(directory, track.gitStartCommit);
        if (changedFiles.length === 0) {
            return {
                success: false,
                error: 'No changes detected. Nothing to revert.'
            };
        }
        // Generate preview
        const preview = formatRevertPreview(track, changedFiles);
        // In a real implementation, this would prompt the user for confirmation
        // For now, we'll just log the preview and require skipConfirmation flag
        if (!skipConfirmation) {
            return {
                success: false,
                preview,
                error: 'Revert requires confirmation. Set skipConfirmation: true to proceed.'
            };
        }
        // Get current branch before reset
        const currentBranch = getCurrentBranch(directory);
        // If we're on the track branch, switch to main/master first
        if (track.gitBranch && currentBranch === track.gitBranch) {
            try {
                // Try main first, then master
                execSync('git checkout main || git checkout master', {
                    cwd: directory,
                    encoding: 'utf-8'
                });
            }
            catch (error) {
                return {
                    success: false,
                    error: `Failed to switch away from track branch: ${error.message}`
                };
            }
        }
        // Execute git reset
        executeGitReset(directory, track.gitStartCommit, hard);
        // Delete track branch if requested
        if (shouldDeleteBranch && track.gitBranch) {
            deleteBranch(directory, track.gitBranch, true);
        }
        // Update track status to reverted
        const updated = updateTrack(directory, slug, {
            status: 'reverted',
            completedAt: new Date().toISOString()
        }, sessionId);
        if (!updated) {
            console.warn('Track reverted but failed to update state.');
        }
        return {
            success: true,
            preview
        };
    }
    catch (error) {
        return {
            success: false,
            error: `Revert failed: ${error.message}`
        };
    }
}
/**
 * Preview what would be reverted without executing
 *
 * @param directory - Project root directory
 * @param slug - Track slug
 * @param sessionId - Optional session ID
 * @returns Preview string
 */
export function previewRevert(directory, slug, sessionId) {
    try {
        const track = getTrack(directory, slug, sessionId);
        if (!track) {
            return { success: false, error: `Track "${slug}" not found.` };
        }
        if (!track.gitStartCommit) {
            return {
                success: false,
                error: 'Track has no git start commit. Cannot preview revert.'
            };
        }
        const changedFiles = getChangedFiles(directory, track.gitStartCommit);
        if (changedFiles.length === 0) {
            return {
                success: false,
                error: 'No changes detected. Nothing to revert.'
            };
        }
        const preview = formatRevertPreview(track, changedFiles);
        return {
            success: true,
            preview
        };
    }
    catch (error) {
        return {
            success: false,
            error: `Preview failed: ${error.message}`
        };
    }
}
//# sourceMappingURL=revert.js.map