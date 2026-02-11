/**
 * Conductor State Management
 *
 * Handles:
 * - Persistent state for conductor workflow across phases
 * - Track creation, updates, and lifecycle management
 * - Session-scoped state with legacy fallback
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { resolveSessionStatePath, ensureSessionStateDir } from '../../lib/worktree-paths.js';
import { canStartMode } from '../mode-registry/index.js';
const STATE_FILE = 'conductor-state.json';
const CONDUCTOR_DIR = 'conductor';
const STATE_VERSION = '1.0.0';
// ============================================================================
// STATE MANAGEMENT
// ============================================================================
/**
 * Get the state file path
 */
function getStateFilePath(directory, sessionId) {
    if (sessionId) {
        return resolveSessionStatePath('conductor', sessionId, directory);
    }
    // Legacy fallback
    const omcDir = join(directory, '.omc');
    return join(omcDir, CONDUCTOR_DIR, STATE_FILE);
}
/**
 * Ensure the .omc/state directory exists
 */
function ensureStateDir(directory, sessionId) {
    if (sessionId) {
        ensureSessionStateDir(sessionId, directory);
        return;
    }
    // Legacy path
    const conductorDir = join(directory, '.omc', CONDUCTOR_DIR);
    if (!existsSync(conductorDir)) {
        mkdirSync(conductorDir, { recursive: true });
    }
}
/**
 * Ensure conductor directory structure exists
 */
export function ensureConductorDirs(directory) {
    const dirs = [
        join(directory, '.omc', CONDUCTOR_DIR),
        join(directory, '.omc', CONDUCTOR_DIR, 'specs'),
        join(directory, '.omc', CONDUCTOR_DIR, 'plans'),
        join(directory, '.omc', CONDUCTOR_DIR, 'reviews')
    ];
    for (const dir of dirs) {
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
    }
}
/**
 * Read conductor state from disk
 */
export function readConductorState(directory, sessionId) {
    if (sessionId) {
        // Session-scoped ONLY — no legacy fallback
        const sessionFile = getStateFilePath(directory, sessionId);
        if (!existsSync(sessionFile))
            return null;
        try {
            const content = readFileSync(sessionFile, 'utf-8');
            const state = JSON.parse(content);
            // Validate session identity
            if (state.session_id && state.session_id !== sessionId)
                return null;
            return state;
        }
        catch {
            return null;
        }
    }
    // No sessionId: legacy path (backward compat)
    const stateFile = getStateFilePath(directory);
    if (!existsSync(stateFile)) {
        return null;
    }
    try {
        const content = readFileSync(stateFile, 'utf-8');
        return JSON.parse(content);
    }
    catch {
        return null;
    }
}
/**
 * Write conductor state to disk (atomic write)
 */
export function writeConductorState(directory, state, sessionId) {
    try {
        ensureStateDir(directory, sessionId);
        const stateFile = getStateFilePath(directory, sessionId);
        // Update metadata
        state._meta.lastWriteAt = new Date().toISOString();
        state._meta.cwd = directory;
        // Atomic write: write to temp file, then rename
        const tmpFile = `${stateFile}.tmp`;
        writeFileSync(tmpFile, JSON.stringify(state, null, 2), 'utf-8');
        // Rename is atomic on most filesystems
        if (existsSync(stateFile)) {
            unlinkSync(stateFile);
        }
        writeFileSync(stateFile, readFileSync(tmpFile, 'utf-8'));
        unlinkSync(tmpFile);
        return true;
    }
    catch (err) {
        console.error('Failed to write conductor state:', err);
        return false;
    }
}
/**
 * Clear conductor state
 */
export function clearConductorState(directory, sessionId) {
    const stateFile = getStateFilePath(directory, sessionId);
    if (!existsSync(stateFile)) {
        return true;
    }
    try {
        unlinkSync(stateFile);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Initialize a new conductor session
 */
export function initConductor(directory, sessionId) {
    // Mutual exclusion check via mode-registry
    const canStart = canStartMode('conductor', directory);
    if (!canStart.allowed) {
        throw new Error(canStart.message);
    }
    const now = new Date().toISOString();
    const state = {
        active: true,
        context: {
            productDefinition: null,
            techStackPath: null,
            workflowPath: null,
            styleguides: [],
            initializedAt: now,
            bootstrappedFromProjectMemory: false
        },
        activeTrack: null,
        tracks: {},
        session_id: sessionId,
        _meta: {
            version: STATE_VERSION,
            lastWriteAt: now,
            cwd: directory
        }
    };
    ensureConductorDirs(directory);
    writeConductorState(directory, state, sessionId);
    return state;
}
// ============================================================================
// TRACK MANAGEMENT
// ============================================================================
/**
 * Generate a URL-safe slug from title
 */
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
/**
 * Create a new track
 */
export function createTrack(directory, title, description, sessionId) {
    const state = readConductorState(directory, sessionId);
    if (!state) {
        throw new Error('Conductor not initialized');
    }
    const slug = generateSlug(title);
    // Check for duplicate slug
    if (state.tracks[slug]) {
        throw new Error(`Track with slug "${slug}" already exists`);
    }
    const now = new Date().toISOString();
    const track = {
        slug,
        title,
        description,
        status: 'spec',
        phase: 'spec',
        specPath: null,
        planPath: null,
        reviewPath: null,
        tasks: [],
        currentTaskIndex: 0,
        gitBranch: null,
        gitStartCommit: null,
        createdAt: now,
        updatedAt: now,
        completedAt: null
    };
    state.tracks[slug] = track;
    state.activeTrack = slug;
    writeConductorState(directory, state, sessionId);
    return track;
}
/**
 * Get a track by slug
 */
export function getTrack(directory, slug, sessionId) {
    const state = readConductorState(directory, sessionId);
    if (!state) {
        return null;
    }
    return state.tracks[slug] || null;
}
/**
 * Update a track
 */
export function updateTrack(directory, slug, updates, sessionId) {
    const state = readConductorState(directory, sessionId);
    if (!state || !state.tracks[slug]) {
        return false;
    }
    const now = new Date().toISOString();
    state.tracks[slug] = {
        ...state.tracks[slug],
        ...updates,
        updatedAt: now
    };
    return writeConductorState(directory, state, sessionId);
}
/**
 * Update conductor context
 */
export function updateContext(directory, updates, sessionId) {
    const state = readConductorState(directory, sessionId);
    if (!state) {
        return false;
    }
    state.context = {
        ...state.context,
        ...updates
    };
    return writeConductorState(directory, state, sessionId);
}
/**
 * Set the active track
 */
export function setActiveTrack(directory, slug, sessionId) {
    const state = readConductorState(directory, sessionId);
    if (!state) {
        return false;
    }
    if (slug !== null && !state.tracks[slug]) {
        return false;
    }
    state.activeTrack = slug;
    return writeConductorState(directory, state, sessionId);
}
/**
 * Add a task to a track
 */
export function addTrackTask(directory, slug, description, sessionId) {
    const state = readConductorState(directory, sessionId);
    if (!state || !state.tracks[slug]) {
        return null;
    }
    const track = state.tracks[slug];
    const taskId = `${slug}-task-${track.tasks.length + 1}`;
    const task = {
        id: taskId,
        description,
        status: 'spec',
        files: [],
        completedAt: null
    };
    track.tasks.push(task);
    track.updatedAt = new Date().toISOString();
    writeConductorState(directory, state, sessionId);
    return task;
}
/**
 * Update a task within a track
 */
export function updateTrackTask(directory, slug, taskId, updates, sessionId) {
    const state = readConductorState(directory, sessionId);
    if (!state || !state.tracks[slug]) {
        return false;
    }
    const track = state.tracks[slug];
    const taskIndex = track.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
        return false;
    }
    track.tasks[taskIndex] = {
        ...track.tasks[taskIndex],
        ...updates
    };
    track.updatedAt = new Date().toISOString();
    return writeConductorState(directory, state, sessionId);
}
/**
 * Get all tracks
 */
export function getAllTracks(directory, sessionId) {
    const state = readConductorState(directory, sessionId);
    if (!state) {
        return [];
    }
    return Object.values(state.tracks);
}
/**
 * Get tracks by status
 */
export function getTracksByStatus(directory, status, sessionId) {
    const tracks = getAllTracks(directory, sessionId);
    return tracks.filter(t => t.status === status);
}
/**
 * Check if conductor is active
 */
export function isConductorActive(directory, sessionId) {
    const state = readConductorState(directory, sessionId);
    return state !== null && state.active === true;
}
/**
 * Deactivate conductor
 */
export function deactivateConductor(directory, sessionId) {
    const state = readConductorState(directory, sessionId);
    if (!state) {
        return false;
    }
    state.active = false;
    return writeConductorState(directory, state, sessionId);
}
/**
 * Get spec file path for a track
 */
export function getSpecPath(directory, slug) {
    return join(directory, '.omc', CONDUCTOR_DIR, 'specs', `${slug}.md`);
}
/**
 * Get plan file path for a track
 */
export function getPlanPath(directory, slug) {
    return join(directory, '.omc', CONDUCTOR_DIR, 'plans', `${slug}.md`);
}
/**
 * Get review file path for a track
 */
export function getReviewPath(directory, slug) {
    return join(directory, '.omc', CONDUCTOR_DIR, 'reviews', `${slug}.md`);
}
//# sourceMappingURL=state.js.map