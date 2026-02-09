import { describe, it, expect } from 'vitest';
import { initTeamPipelineState, markTeamPhase } from '../state.js';
import { transitionTeamPhase } from '../transitions.js';
describe('team pipeline transitions', () => {
    it('allows canonical plan -> prd -> exec transitions', () => {
        const state = initTeamPipelineState('/tmp/project', 'sid-1');
        const toPrd = transitionTeamPhase(state, 'team-prd');
        expect(toPrd.ok).toBe(true);
        const withPlan = {
            ...toPrd.state,
            artifacts: { ...toPrd.state.artifacts, plan_path: '.omc/plans/team.md' },
        };
        const toExec = transitionTeamPhase(withPlan, 'team-exec');
        expect(toExec.ok).toBe(true);
        expect(toExec.state.phase).toBe('team-exec');
    });
    it('rejects illegal transition', () => {
        const state = initTeamPipelineState('/tmp/project', 'sid-2');
        const result = transitionTeamPhase(state, 'team-verify');
        expect(result.ok).toBe(false);
        expect(result.reason).toContain('Illegal transition');
    });
    it('bounds fix loop and transitions to failed on overflow', () => {
        const state = initTeamPipelineState('/tmp/project', 'sid-3');
        const verifyState = {
            ...state,
            phase: 'team-verify',
            artifacts: { ...state.artifacts, plan_path: '.omc/plans/team.md' },
        };
        const toFix1 = transitionTeamPhase(verifyState, 'team-fix');
        expect(toFix1.ok).toBe(true);
        const exhausted = {
            ...toFix1.state,
            phase: 'team-fix',
            fix_loop: { ...toFix1.state.fix_loop, attempt: toFix1.state.fix_loop.max_attempts },
        };
        const overflow = markTeamPhase(exhausted, 'team-fix', 'retry');
        expect(overflow.ok).toBe(false);
        expect(overflow.state.phase).toBe('failed');
        expect(overflow.reason).toContain('Fix loop exceeded');
    });
});
//# sourceMappingURL=transitions.test.js.map