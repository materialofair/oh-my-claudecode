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
//# sourceMappingURL=index.d.ts.map