/**
 * Conductor Hook Module
 *
 * Main entry point for the /conductor command - product-centered
 * development workflow with tracks.
 */
export { DEFAULT_CONDUCTOR_CONFIG } from './types.js';
// State management
export { readConductorState, writeConductorState, clearConductorState, initConductor, ensureConductorDirs, createTrack, getTrack, updateTrack, updateContext, setActiveTrack, addTrackTask, updateTrackTask, getAllTracks, getTracksByStatus, isConductorActive, deactivateConductor, getSpecPath, getPlanPath, getReviewPath } from './state.js';
export { createNewTrack, proceedToPlanning, reviewTrack, loadTrack, getSpecContent, getPlanContent } from './track.js';
export { displayStatus } from './status.js';
/**
 * Process conductor commands from the bridge
 *
 * Commands:
 * - setup: Initialize conductor for the current project
 * - track <title>: Create a new track
 * - plan <slug>: Move track to planning phase
 * - review <slug>: Move track to review phase
 * - status [slug]: Show status
 */
export async function processConductor(input) {
    // Parse command and args
    // Input format: "conductor <command> <args>" or just "<command> <args>" depending on how bridge calls it
    // Bridge calls it with: return await processConductor(input); where input is the full input string
    // Remove "conductor" prefix if present
    const cleanInput = input.replace(/^conductor\s+/, '').trim();
    const parts = cleanInput.split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);
    const cwd = process.cwd();
    try {
        switch (command) {
            case 'setup': {
                const { initConductor } = await import('./state.js');
                const { getSetupPrompt } = await import('./prompts.js');
                initConductor(cwd);
                const prompt = getSetupPrompt();
                return `Conductor initialized. Starting setup...\n\nTask(subagent_type="oh-my-claudecode:product-manager", prompt="${prompt}")`;
            }
            case 'track': {
                if (args.length === 0) {
                    return 'Usage: /conductor track <title> [description]';
                }
                const title = args[0];
                const description = args.slice(1).join(' ') || title;
                const { createNewTrack } = await import('./track.js');
                const { track, instruction } = await createNewTrack(cwd, title, description);
                return `Created track: ${track.slug}\n\n${instruction}`;
            }
            case 'plan': {
                if (args.length === 0) {
                    return 'Usage: /conductor plan <slug>';
                }
                const slug = args[0];
                const { proceedToPlanning } = await import('./track.js');
                const { instruction } = await proceedToPlanning(cwd, slug);
                return `Starting planning for ${slug}...\n\n${instruction}`;
            }
            case 'review': {
                if (args.length === 0) {
                    return 'Usage: /conductor review <slug>';
                }
                const slug = args[0];
                const { reviewTrack } = await import('./track.js');
                const { instruction } = await reviewTrack(cwd, slug);
                return `Starting review for ${slug}...\n\n${instruction}`;
            }
            case 'status': {
                const slug = args[0]; // Optional
                const { displayStatus } = await import('./status.js');
                return displayStatus(cwd, slug);
            }
            case 'help':
            default: {
                return `
Conductor - Product-Centered Workflow

Commands:
  /conductor setup           - Initialize conductor in this project
  /conductor track <title>   - Create a new feature track
  /conductor status [slug]   - Show status of all tracks or specific track
  /conductor plan <slug>     - Move track to planning phase (Agent: Architect)
  /conductor review <slug>   - Move track to review phase (Agent: Reviewer)
  /conductor help            - Show this help message
`;
            }
        }
    }
    catch (error) {
        return `Error executing conductor command: ${error.message}`;
    }
}
//# sourceMappingURL=index.js.map