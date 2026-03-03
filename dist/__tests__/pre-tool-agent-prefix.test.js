/**
 * Test: Pre-Tool-Use Hook Agent Prefix Stripping
 *
 * Ensures that the pre-tool-use hook correctly strips the oh-my-claudecode:
 * prefix from subagent_type before the tool call reaches Claude Code.
 */
import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';
describe('Pre-Tool-Use Hook: Agent Prefix Stripping', () => {
    const hookPath = join(process.env.HOME || '', '.claude', 'hooks', 'pre-tool-use.mjs');
    it('should have pre-tool-use hook installed', () => {
        expect(existsSync(hookPath)).toBe(true);
    });
    it('should strip oh-my-claudecode: prefix from Agent tool calls', () => {
        const input = JSON.stringify({
            tool_name: 'Agent',
            tool_input: {
                subagent_type: 'oh-my-claudecode:architect',
                description: 'Test agent call',
                prompt: 'Analyze something'
            }
        });
        const output = execSync(`echo '${input}' | node "${hookPath}"`, {
            encoding: 'utf-8'
        });
        const result = JSON.parse(output.trim());
        expect(result.continue).toBe(true);
        expect(result.modifiedInput).toBeDefined();
        expect(result.modifiedInput.subagent_type).toBe('architect');
        expect(result.modifiedInput.description).toBe('Test agent call');
        expect(result.modifiedInput.prompt).toBe('Analyze something');
    });
    it('should strip oh-my-claudecode: prefix from Task tool calls', () => {
        const input = JSON.stringify({
            tool_name: 'Task',
            tool_input: {
                subagent_type: 'oh-my-claudecode:executor',
                description: 'Test task call',
                prompt: 'Execute something'
            }
        });
        const output = execSync(`echo '${input}' | node "${hookPath}"`, {
            encoding: 'utf-8'
        });
        const result = JSON.parse(output.trim());
        expect(result.continue).toBe(true);
        expect(result.modifiedInput).toBeDefined();
        expect(result.modifiedInput.subagent_type).toBe('executor');
    });
    it('should not modify agent calls without oh-my-claudecode: prefix', () => {
        const input = JSON.stringify({
            tool_name: 'Agent',
            tool_input: {
                subagent_type: 'architect',
                description: 'Test agent call',
                prompt: 'Analyze something'
            }
        });
        const output = execSync(`echo '${input}' | node "${hookPath}"`, {
            encoding: 'utf-8'
        });
        const result = JSON.parse(output.trim());
        expect(result.continue).toBe(true);
        expect(result.modifiedInput).toBeUndefined();
    });
    it('should handle all OMC agent types', () => {
        const agentTypes = [
            'architect',
            'executor',
            'planner',
            'analyst',
            'critic',
            'verifier',
            'debugger',
            'explore',
            'designer',
            'writer',
            'qa-tester',
            'scientist',
            'deep-executor',
            'test-engineer',
            'build-fixer',
            'security-reviewer',
            'code-reviewer',
            'quality-reviewer',
            'git-master',
            'code-simplifier',
            'document-specialist'
        ];
        for (const agentType of agentTypes) {
            const input = JSON.stringify({
                tool_name: 'Agent',
                tool_input: {
                    subagent_type: `oh-my-claudecode:${agentType}`,
                    description: `Test ${agentType}`,
                    prompt: 'Test prompt'
                }
            });
            const output = execSync(`echo '${input}' | node "${hookPath}"`, {
                encoding: 'utf-8'
            });
            const result = JSON.parse(output.trim());
            expect(result.continue).toBe(true);
            expect(result.modifiedInput).toBeDefined();
            expect(result.modifiedInput.subagent_type).toBe(agentType);
        }
    });
    it('should not affect other tool calls', () => {
        const tools = ['Edit', 'Write', 'Read', 'Bash', 'Grep', 'Glob'];
        for (const tool of tools) {
            const input = JSON.stringify({
                tool_name: tool,
                tool_input: {
                    some_param: 'value'
                }
            });
            const output = execSync(`echo '${input}' | node "${hookPath}"`, {
                encoding: 'utf-8'
            });
            const result = JSON.parse(output.trim());
            expect(result.continue).toBe(true);
            // Should not have modifiedInput for non-Agent tools (unless it's a delegation warning)
            if (tool !== 'Edit' && tool !== 'Write' && tool !== 'Bash') {
                expect(result.modifiedInput).toBeUndefined();
            }
        }
    });
});
//# sourceMappingURL=pre-tool-agent-prefix.test.js.map