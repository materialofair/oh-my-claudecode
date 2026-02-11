/**
 * Conductor Hook Module
 *
 * Main entry point for the /conductor command - product-centered
 * development workflow with tracks.
 */

// Types
export type {
  ConductorPhase,
  ConductorContext,
  TrackStatus,
  TrackTask,
  Track,
  ConductorState,
  ConductorConfig,
  ConductorResult
} from './types.js';

export { DEFAULT_CONDUCTOR_CONFIG } from './types.js';

// State management
export {
  readConductorState,
  writeConductorState,
  clearConductorState,
  initConductor,
  ensureConductorDirs,
  createTrack,
  getTrack,
  updateTrack,
  updateContext,
  setActiveTrack,
  addTrackTask,
  updateTrackTask,
  getAllTracks,
  getTracksByStatus,
  isConductorActive,
  deactivateConductor,
  getSpecPath,
  getPlanPath,
  getReviewPath
} from './state.js';

// Import track functions
import {
  createNewTrack,
  proceedToPlanning,
  reviewTrack,
  loadTrack
} from './track.js';

// Import status display
import { displayStatus } from './status.js';

/**
 * Process conductor hook input
 *
 * Handles commands:
 * - setup: Initialize conductor
 * - track <title>: Create a new track
 * - plan <slug>: Move track to planning phase
 * - review <slug>: Move track to review phase
 * - status [slug]: Show status
 */
export async function processConductor(input: string): Promise<string> {
  const args = input.trim().split(/\s+/);
  const command = args[0];
  const cwd = process.cwd();

  try {
    switch (command) {
      case 'setup':
        // Setup is handled via direct tool calls usually, but we can provide instructions
        return 'Run /conductor setup to initialize. (Not fully implemented in hook yet)';

      case 'track':
        if (args.length < 2) {
          return 'Usage: /conductor track <title> [description]';
        }
        const title = args[1];
        // Join remaining args as description, or default to title
        const description = args.slice(2).join(' ') || title;

        const createResult = await createNewTrack(cwd, title, description);
        return `Track created: ${createResult.track.slug}\n\n${createResult.instruction}`;

      case 'plan':
        if (args.length < 2) {
          return 'Usage: /conductor plan <slug>';
        }
        const planSlug = args[1];
        const planResult = await proceedToPlanning(cwd, planSlug);
        return `Planning started for: ${planResult.track.slug}\n\n${planResult.instruction}`;

      case 'review':
        if (args.length < 2) {
          return 'Usage: /conductor review <slug>';
        }
        const reviewSlug = args[1];
        const reviewResult = await reviewTrack(cwd, reviewSlug);
        return `Review started for: ${reviewResult.track.slug}\n\n${reviewResult.instruction}`;

      case 'status':
        const statusSlug = args.length > 1 ? args[1] : undefined;
        return displayStatus(cwd, statusSlug);

      case 'help':
      default:
        return `
Conductor Commands:
  /conductor track <title> [desc]  Create a new track and start spec
  /conductor plan <slug>           Start planning phase for a track
  /conductor review <slug>         Start review phase for a track
  /conductor status [slug]         Show status of all tracks or specific track
`;
    }
  } catch (error) {
    if (error instanceof Error) {
      return `Error: ${error.message}`;
    }
    return 'An unknown error occurred processing conductor command.';
  }
}

export {
  createNewTrack,
  proceedToPlanning,
  reviewTrack,
  loadTrack,
  getSpecContent,
  getPlanContent
} from './track.js';

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
export async function processConductor(input: string): Promise<string> {
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
  } catch (error: any) {
    return `Error executing conductor command: ${error.message}`;
  }
}
