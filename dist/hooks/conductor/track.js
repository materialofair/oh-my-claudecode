/**
 * Conductor Track Creation and Management
 *
 * Handles:
 * - Creating new tracks with spec/plan/implement workflow
 * - Delegating to specialized agents (analyst, planner, executor)
 * - Parsing plan.md into TrackTask array
 * - Recording git state for tracking changes
 */
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { readConductorState, createTrack as createTrackState, updateTrack, getSpecPath, getPlanPath, ensureConductorDirs } from './state.js';
import { getSpecPrompt, getPlanPrompt, formatContextForPrompt } from './prompts.js';
// ============================================================================
// GIT UTILITIES
// ============================================================================
/**
 * Get the current git commit SHA
 */
function getCurrentGitCommit(directory) {
    try {
        const sha = execSync('git rev-parse HEAD', {
            cwd: directory,
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe']
        }).trim();
        return sha;
    }
    catch {
        return null;
    }
}
/**
 * Create a git branch for the track
 */
function createGitBranch(directory, slug) {
    try {
        const branchName = `conductor/${slug}`;
        execSync(`git checkout -b ${branchName}`, {
            cwd: directory,
            stdio: ['pipe', 'pipe', 'pipe']
        });
        return branchName;
    }
    catch {
        return null;
    }
}
// ============================================================================
// PLAN PARSING
// ============================================================================
/**
 * Parse a plan.md file into TrackTask array
 *
 * Expected format:
 * ## Tasks
 * 1. Task description here
 * 2. Another task description
 * 3. Yet another task
 */
function parsePlanTasks(planContent, trackSlug) {
    const tasks = [];
    // Find the Tasks section
    const tasksMatch = planContent.match(/##\s+Tasks\s*\n([\s\S]*?)(?=\n##|$)/i);
    if (!tasksMatch) {
        return tasks;
    }
    const tasksSection = tasksMatch[1];
    // Parse numbered list items
    const taskLines = tasksSection.match(/^\d+\.\s+(.+)$/gm);
    if (!taskLines) {
        return tasks;
    }
    taskLines.forEach((line, index) => {
        const description = line.replace(/^\d+\.\s+/, '').trim();
        if (description) {
            tasks.push({
                id: `${trackSlug}-task-${index + 1}`,
                description,
                status: 'spec',
                files: [],
                completedAt: null
            });
        }
    });
    return tasks;
}
// ============================================================================
// AGENT DELEGATION
// ============================================================================
/**
 * Delegate to analyst agent to create specification
 * Returns the Task tool invocation string
 */
async function delegateToAnalyst(context, trackDescription, specPath) {
    // Format context for the prompt
    const contextStr = formatContextForPrompt(context);
    const prompt = getSpecPrompt(contextStr, trackDescription);
    // Create the Task tool invocation
    return `Task(subagent_type="oh-my-claudecode:product-manager", prompt="${prompt}\\n\\nIMPORTANT: Write the specification to ${specPath}")`;
}
/**
 * Delegate to architect agent to create implementation plan
 * Returns the Task tool invocation string
 */
async function delegateToArchitect(context, specPath, planPath) {
    // Read spec content
    const specContent = readFileSync(specPath, 'utf-8');
    // Format context for the prompt
    const contextStr = formatContextForPrompt(context);
    const prompt = getPlanPrompt(contextStr, specContent);
    // Create the Task tool invocation
    return `Task(subagent_type="oh-my-claudecode:architect", prompt="${prompt}\\n\\nIMPORTANT: Write the plan to ${planPath}")`;
}
// ============================================================================
// TRACK CREATION
// ============================================================================
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
export async function createNewTrack(directory, title, description, sessionId, createBranch = true) {
    // Ensure conductor directories exist
    ensureConductorDirs(directory);
    // Read current state to get context
    const state = readConductorState(directory, sessionId);
    if (!state) {
        throw new Error('Conductor not initialized. Run /conductor setup first.');
    }
    // Create initial track state
    const track = createTrackState(directory, title, description, sessionId);
    const { slug } = track;
    // Record git starting commit
    const gitStartCommit = getCurrentGitCommit(directory);
    // Optionally create git branch
    let gitBranch = null;
    if (createBranch) {
        gitBranch = createGitBranch(directory, slug);
    }
    // Update track with git information and set to spec phase
    updateTrack(directory, slug, {
        gitStartCommit,
        gitBranch,
        phase: 'spec',
        status: 'spec'
    }, sessionId);
    // Get path for spec file
    const specPath = getSpecPath(directory, slug);
    // Generate instruction to delegate to analyst
    const instruction = await delegateToAnalyst(state.context, description, specPath);
    // Return the updated track and instruction
    const updatedState = readConductorState(directory, sessionId);
    return {
        track: updatedState.tracks[slug],
        instruction
    };
}
/**
 * Proceed to planning phase for an existing track
 */
export async function proceedToPlanning(directory, slug, sessionId) {
    const state = readConductorState(directory, sessionId);
    if (!state)
        throw new Error('Conductor not initialized');
    const track = state.tracks[slug];
    if (!track)
        throw new Error(`Track ${slug} not found`);
    const specPath = getSpecPath(directory, slug);
    if (!existsSync(specPath)) {
        throw new Error(`Specification file not found at ${specPath}`);
    }
    const planPath = getPlanPath(directory, slug);
    // Update track phase
    updateTrack(directory, slug, {
        phase: 'planning',
        specPath
    }, sessionId);
    const instruction = await delegateToArchitect(state.context, specPath, planPath);
    const updatedState = readConductorState(directory, sessionId);
    return {
        track: updatedState.tracks[slug],
        instruction
    };
}
/**
 * Review a track implementation
 */
export async function reviewTrack(directory, slug, sessionId) {
    const state = readConductorState(directory, sessionId);
    if (!state)
        throw new Error('Conductor not initialized');
    const track = state.tracks[slug];
    if (!track)
        throw new Error(`Track ${slug} not found`);
    // Determine diff since start
    let diff = '';
    try {
        if (track.gitStartCommit) {
            diff = execSync(`git diff ${track.gitStartCommit} HEAD`, { encoding: 'utf-8', cwd: directory });
        }
    }
    catch (e) {
        console.warn('Failed to get git diff for review', e);
        diff = 'Could not retrieve git diff.';
    }
    // Get paths
    const specPath = getSpecPath(directory, slug);
    const planPath = getPlanPath(directory, slug);
    const reviewPath = join(directory, '.omc', 'conductor', 'tracks', slug, 'review.md');
    // Load content if available
    let specContent = 'Spec not found';
    let planContent = 'Plan not found';
    try {
        specContent = readFileSync(specPath, 'utf-8');
    }
    catch { }
    try {
        planContent = readFileSync(planPath, 'utf-8');
    }
    catch { }
    // Import getReviewPrompt (need to update imports)
    const { getReviewPrompt } = await import('./prompts.js');
    const contextStr = formatContextForPrompt(state.context);
    const prompt = getReviewPrompt(contextStr, specContent, planContent, diff);
    // Update track
    updateTrack(directory, slug, {
        phase: 'reviewing',
        status: 'review'
    }, sessionId);
    const instruction = `Task(subagent_type="oh-my-claudecode:quality-reviewer", prompt="${prompt}\\n\\nIMPORTANT: Write the review to ${reviewPath}")`;
    const updatedState = readConductorState(directory, sessionId);
    return {
        track: updatedState.tracks[slug],
        instruction
    };
}
/**
 * Load an existing track by slug
 */
export function loadTrack(directory, slug, sessionId) {
    const state = readConductorState(directory, sessionId);
    if (!state) {
        return null;
    }
    return state.tracks[slug] || null;
}
/**
 * Get the spec content for a track
 */
export function getSpecContent(directory, slug) {
    const specPath = getSpecPath(directory, slug);
    if (!existsSync(specPath)) {
        return null;
    }
    try {
        return readFileSync(specPath, 'utf-8');
    }
    catch {
        return null;
    }
}
/**
 * Get the plan content for a track
 */
export function getPlanContent(directory, slug) {
    const planPath = getPlanPath(directory, slug);
    if (!existsSync(planPath)) {
        return null;
    }
    try {
        return readFileSync(planPath, 'utf-8');
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=track.js.map