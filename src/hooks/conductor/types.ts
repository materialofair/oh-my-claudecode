/**
 * Conductor Types
 *
 * Type definitions for the /conductor command - product-centered development workflow.
 *
 * The conductor feature orchestrates product-centered development through tracks:
 * 1. Spec: Product Manager creates feature specification
 * 2. Planning: Architect creates technical implementation plan
 * 3. Implementing: Executor builds the feature
 * 4. Reviewing: Quality Reviewer verifies implementation
 * 5. Complete: Feature is done and merged
 */

/**
 * Represents the current phase of conductor execution
 */
export type ConductorPhase =
  | 'setup'        // Initial setup: load product definition, tech stack, workflow
  | 'idle'         // Ready for track creation
  | 'spec'         // Product Manager writing feature spec
  | 'planning'     // Architect creating implementation plan
  | 'implementing' // Executor building the feature
  | 'reviewing'    // Quality Reviewer verifying work
  | 'complete';    // Conductor workflow complete

/**
 * Status of a track through the conductor pipeline
 */
export type TrackStatus =
  | 'spec'        // Specification being written
  | 'planned'     // Implementation plan created
  | 'in_progress' // Currently implementing
  | 'review'      // Under quality review
  | 'done'        // Completed and merged
  | 'reverted';   // Reverted due to issues

/**
 * Context information initialized at conductor setup
 */
export interface ConductorContext {
  /** Path to product definition document */
  productDefinition: string | null;
  /** Path to tech stack documentation */
  techStackPath: string | null;
  /** Path to workflow/process documentation */
  workflowPath: string | null;
  /** Paths to style guides and conventions */
  styleguides: string[];
  /** Timestamp when conductor was initialized */
  initializedAt: string;
  /** Whether context was bootstrapped from project memory */
  bootstrappedFromProjectMemory: boolean;
}

/**
 * A single task within a track
 */
export interface TrackTask {
  /** Unique task identifier */
  id: string;
  /** Task description */
  description: string;
  /** Current task status */
  status: TrackStatus;
  /** Files modified by this task */
  files: string[];
  /** Timestamp when task was completed */
  completedAt: string | null;
}

/**
 * A track represents a single feature or work item
 */
export interface Track {
  /** URL-safe identifier (e.g., "add-user-auth") */
  slug: string;
  /** Human-readable title */
  title: string;
  /** Brief description of the feature */
  description: string;
  /** Current track status */
  status: TrackStatus;
  /** Current conductor phase for this track */
  phase: ConductorPhase;
  /** Path to spec document */
  specPath: string | null;
  /** Path to implementation plan */
  planPath: string | null;
  /** Path to review document */
  reviewPath: string | null;
  /** List of tasks for this track */
  tasks: TrackTask[];
  /** Index of current task being worked on */
  currentTaskIndex: number;
  /** Git branch for this track */
  gitBranch: string | null;
  /** Git commit hash when track started */
  gitStartCommit: string | null;
  /** Timestamp when track was created */
  createdAt: string;
  /** Timestamp when track was last updated */
  updatedAt: string;
  /** Timestamp when track was completed */
  completedAt: string | null;
}

/**
 * Complete conductor state
 */
export interface ConductorState {
  /** Whether conductor is currently active */
  active: boolean;
  /** Context information from setup phase */
  context: ConductorContext;
  /** Slug of the currently active track */
  activeTrack: string | null;
  /** Map of track slug to Track */
  tracks: Record<string, Track>;
  /** Session binding */
  session_id?: string;
  /** Metadata for state management */
  _meta: {
    /** State format version */
    version: string;
    /** Last write timestamp */
    lastWriteAt: string;
    /** Working directory */
    cwd: string;
  };
}

/**
 * Configuration options for conductor behavior
 */
export interface ConductorConfig {
  /** Automatically create git branch for each track */
  autoCreateBranch?: boolean;
  /** Automatically merge track when complete */
  autoMerge?: boolean;
  /** Maximum concurrent tracks */
  maxConcurrentTracks?: number;
  /** Skip review phase */
  skipReview?: boolean;
  /** Agents to use for each phase */
  agents?: {
    spec?: string;
    planning?: string;
    implementing?: string;
    reviewing?: string;
  };
}

/**
 * Result returned when conductor operations complete
 */
export interface ConductorResult {
  /** Whether operation completed successfully */
  success: boolean;
  /** Result data (track, state, etc.) */
  data?: any;
  /** Error message if failed */
  error?: string;
}

/**
 * Default configuration for conductor
 */
export const DEFAULT_CONDUCTOR_CONFIG: ConductorConfig = {
  autoCreateBranch: true,
  autoMerge: false,
  maxConcurrentTracks: 3,
  skipReview: false,
  agents: {
    spec: 'oh-my-claudecode:product-manager',
    planning: 'oh-my-claudecode:architect',
    implementing: 'oh-my-claudecode:executor',
    reviewing: 'oh-my-claudecode:quality-reviewer'
  }
};
