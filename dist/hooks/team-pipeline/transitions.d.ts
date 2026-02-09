import type { TeamPipelinePhase, TeamPipelineState, TeamTransitionResult } from './types.js';
export declare function transitionTeamPhase(state: TeamPipelineState, next: TeamPipelinePhase, reason?: string): TeamTransitionResult;
export declare function requestTeamCancel(state: TeamPipelineState, preserveForResume?: boolean): TeamPipelineState;
//# sourceMappingURL=transitions.d.ts.map