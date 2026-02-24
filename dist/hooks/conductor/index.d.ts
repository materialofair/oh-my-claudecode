/**
 * Conductor Hook Module
 *
 * Main entry point for the /conductor command - product-centered
 * development workflow with tracks.
 */
export type { ConductorPhase, ConductorContext, TrackStatus, TrackTask, Track, ConductorState, ConductorConfig, ConductorResult } from './types.js';
export { DEFAULT_CONDUCTOR_CONFIG } from './types.js';
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
export declare function processConductor(input: string): Promise<string>;
//# sourceMappingURL=index.d.ts.map