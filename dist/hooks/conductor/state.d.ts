/**
 * Conductor State Management
 *
 * Handles:
 * - Persistent state for conductor workflow across phases
 * - Track creation, updates, and lifecycle management
 * - Session-scoped state with legacy fallback
 */
import type { ConductorState, ConductorContext, Track, TrackTask, TrackStatus } from './types.js';
/**
 * Ensure conductor directory structure exists
 */
export declare function ensureConductorDirs(directory: string): void;
/**
 * Read conductor state from disk
 */
export declare function readConductorState(directory: string, sessionId?: string): ConductorState | null;
/**
 * Write conductor state to disk (atomic write)
 */
export declare function writeConductorState(directory: string, state: ConductorState, sessionId?: string): boolean;
/**
 * Clear conductor state
 */
export declare function clearConductorState(directory: string, sessionId?: string): boolean;
/**
 * Initialize a new conductor session
 */
export declare function initConductor(directory: string, sessionId?: string): ConductorState;
/**
 * Create a new track
 */
export declare function createTrack(directory: string, title: string, description: string, sessionId?: string): Track;
/**
 * Get a track by slug
 */
export declare function getTrack(directory: string, slug: string, sessionId?: string): Track | null;
/**
 * Update a track
 */
export declare function updateTrack(directory: string, slug: string, updates: Partial<Track>, sessionId?: string): boolean;
/**
 * Update conductor context
 */
export declare function updateContext(directory: string, updates: Partial<ConductorContext>, sessionId?: string): boolean;
/**
 * Set the active track
 */
export declare function setActiveTrack(directory: string, slug: string | null, sessionId?: string): boolean;
/**
 * Add a task to a track
 */
export declare function addTrackTask(directory: string, slug: string, description: string, sessionId?: string): TrackTask | null;
/**
 * Update a task within a track
 */
export declare function updateTrackTask(directory: string, slug: string, taskId: string, updates: Partial<TrackTask>, sessionId?: string): boolean;
/**
 * Get all tracks
 */
export declare function getAllTracks(directory: string, sessionId?: string): Track[];
/**
 * Get tracks by status
 */
export declare function getTracksByStatus(directory: string, status: TrackStatus, sessionId?: string): Track[];
/**
 * Check if conductor is active
 */
export declare function isConductorActive(directory: string, sessionId?: string): boolean;
/**
 * Deactivate conductor
 */
export declare function deactivateConductor(directory: string, sessionId?: string): boolean;
/**
 * Get spec file path for a track
 */
export declare function getSpecPath(directory: string, slug: string): string;
/**
 * Get plan file path for a track
 */
export declare function getPlanPath(directory: string, slug: string): string;
/**
 * Get review file path for a track
 */
export declare function getReviewPath(directory: string, slug: string): string;
//# sourceMappingURL=state.d.ts.map