import type { TeamPipelinePhase, TeamPipelineState, TeamTransitionResult } from './types.js';
import { markTeamPhase } from './state.js';

const ALLOWED: Record<TeamPipelinePhase, TeamPipelinePhase[]> = {
  'team-plan': ['team-prd'],
  'team-prd': ['team-exec'],
  'team-exec': ['team-verify'],
  'team-verify': ['team-fix', 'complete', 'failed'],
  'team-fix': ['team-exec', 'team-verify', 'complete', 'failed'],
  complete: [],
  failed: [],
  cancelled: [],
};

function isAllowedTransition(from: TeamPipelinePhase, to: TeamPipelinePhase): boolean {
  return ALLOWED[from].includes(to);
}

function hasRequiredArtifactsForPhase(state: TeamPipelineState, next: TeamPipelinePhase): boolean {
  if (next === 'team-exec') {
    return Boolean(state.artifacts.plan_path || state.artifacts.prd_path);
  }
  if (next === 'team-verify') {
    return state.execution.tasks_total >= state.execution.tasks_completed;
  }
  return true;
}

export function transitionTeamPhase(
  state: TeamPipelineState,
  next: TeamPipelinePhase,
  reason?: string,
): TeamTransitionResult {
  if (!isAllowedTransition(state.phase, next)) {
    return {
      ok: false,
      state,
      reason: `Illegal transition: ${state.phase} -> ${next}`,
    };
  }

  if (!hasRequiredArtifactsForPhase(state, next)) {
    return {
      ok: false,
      state,
      reason: `Guard failed for transition: ${state.phase} -> ${next}`,
    };
  }

  return markTeamPhase(state, next, reason);
}

export function requestTeamCancel(state: TeamPipelineState, preserveForResume = true): TeamPipelineState {
  return {
    ...state,
    cancel: {
      ...state.cancel,
      requested: true,
      requested_at: new Date().toISOString(),
      preserve_for_resume: preserveForResume,
    },
    phase: 'cancelled',
    active: false,
    completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    phase_history: [
      ...state.phase_history,
      {
        phase: 'cancelled',
        entered_at: new Date().toISOString(),
        reason: 'cancel-requested',
      },
    ],
  };
}
