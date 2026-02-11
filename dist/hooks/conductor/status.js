/**
 * Conductor Status Display
 *
 * Provides status reporting for conductor tracks and tasks.
 * Shows progress indicators and current state.
 */
import { readConductorState, getAllTracks } from './state.js';
/**
 * Get status indicator character for a track status
 */
function getStatusIndicator(status) {
    switch (status) {
        case 'done':
            return '[x]';
        case 'in_progress':
            return '[>]';
        case 'spec':
        case 'planned':
        case 'review':
            return '[ ]';
        case 'reverted':
            return '[!]';
        default:
            return '[ ]';
    }
}
/**
 * Format a track for display in status overview
 */
function formatTrackSummary(track, isActive) {
    const indicator = getStatusIndicator(track.status);
    const activeMarker = isActive ? ' (active)' : '';
    const completedInfo = track.completedAt
        ? ` - completed ${new Date(track.completedAt).toLocaleDateString()}`
        : '';
    return `${indicator} ${track.slug}${activeMarker} - ${track.status}${completedInfo}
     ${track.title}`;
}
/**
 * Format task-level details for a track
 */
function formatTrackDetails(track) {
    const lines = [];
    lines.push(`Track: ${track.title}`);
    lines.push(`Slug: ${track.slug}`);
    lines.push(`Status: ${track.status}`);
    lines.push(`Phase: ${track.phase}`);
    lines.push(`Created: ${new Date(track.createdAt).toLocaleDateString()}`);
    if (track.completedAt) {
        lines.push(`Completed: ${new Date(track.completedAt).toLocaleDateString()}`);
    }
    if (track.gitBranch) {
        lines.push(`Branch: ${track.gitBranch}`);
    }
    if (track.gitStartCommit) {
        lines.push(`Start Commit: ${track.gitStartCommit.substring(0, 8)}`);
    }
    lines.push('');
    lines.push('Description:');
    lines.push(track.description);
    // Show document paths
    lines.push('');
    lines.push('Documents:');
    if (track.specPath) {
        lines.push(`  Spec: ${track.specPath}`);
    }
    if (track.planPath) {
        lines.push(`  Plan: ${track.planPath}`);
    }
    if (track.reviewPath) {
        lines.push(`  Review: ${track.reviewPath}`);
    }
    // Show tasks if any exist
    if (track.tasks.length > 0) {
        lines.push('');
        lines.push('Tasks:');
        track.tasks.forEach((task, index) => {
            const indicator = getStatusIndicator(task.status);
            const current = index === track.currentTaskIndex ? ' <- current' : '';
            const completed = task.completedAt
                ? ` (completed ${new Date(task.completedAt).toLocaleDateString()})`
                : '';
            lines.push(`  ${indicator} ${task.id}${current}${completed}`);
            lines.push(`     ${task.description}`);
            if (task.files.length > 0) {
                lines.push(`     Files: ${task.files.join(', ')}`);
            }
        });
    }
    return lines.join('\n');
}
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
export function displayStatus(directory, slug, sessionId) {
    const state = readConductorState(directory, sessionId);
    if (!state) {
        return 'Conductor not initialized. Run /conductor setup first.';
    }
    if (!state.active) {
        return 'Conductor is not active.';
    }
    // If slug provided, show detailed view for that track
    if (slug) {
        const track = state.tracks[slug];
        if (!track) {
            return `Track "${slug}" not found.`;
        }
        return formatTrackDetails(track);
    }
    // Otherwise, show overview of all tracks
    const tracks = getAllTracks(directory, sessionId);
    if (tracks.length === 0) {
        return 'No tracks yet. Create a track with /conductor track <title>';
    }
    const lines = [];
    lines.push('Conductor Status');
    lines.push('================\n');
    // Show active track first
    if (state.activeTrack) {
        const activeTrack = state.tracks[state.activeTrack];
        if (activeTrack) {
            lines.push('Active Track:');
            lines.push(formatTrackSummary(activeTrack, true));
            lines.push('');
        }
    }
    // Group tracks by status
    const byStatus = {
        spec: [],
        planned: [],
        in_progress: [],
        review: [],
        done: [],
        reverted: []
    };
    tracks.forEach(track => {
        byStatus[track.status].push(track);
    });
    // Display each status group
    const statusOrder = ['in_progress', 'review', 'planned', 'spec', 'done', 'reverted'];
    statusOrder.forEach(status => {
        const tracksInStatus = byStatus[status];
        if (tracksInStatus.length > 0) {
            const statusLabel = status.replace('_', ' ').toUpperCase();
            lines.push(`${statusLabel}:`);
            tracksInStatus.forEach(track => {
                const isActive = state.activeTrack === track.slug;
                lines.push(formatTrackSummary(track, isActive));
            });
            lines.push('');
        }
    });
    // Summary stats
    const total = tracks.length;
    const done = byStatus.done.length;
    const inProgress = byStatus.in_progress.length;
    const reverted = byStatus.reverted.length;
    lines.push('---');
    lines.push(`Total: ${total} | Done: ${done} | In Progress: ${inProgress} | Reverted: ${reverted}`);
    return lines.join('\n');
}
//# sourceMappingURL=status.js.map