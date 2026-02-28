import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { readConductorState, writeConductorState, clearConductorState, initConductor, createTrack, getTrack, updateTrack, updateContext, setActiveTrack, addTrackTask, updateTrackTask, getAllTracks, getTracksByStatus, isConductorActive, deactivateConductor, getSpecPath, getPlanPath, getReviewPath, ensureConductorDirs } from '../state.js';
describe('ConductorState', () => {
    let testDir;
    beforeEach(() => {
        testDir = mkdtempSync(join(tmpdir(), 'conductor-test-'));
    });
    afterEach(() => {
        rmSync(testDir, { recursive: true, force: true });
    });
    describe('readConductorState', () => {
        it('should return null when state file does not exist', () => {
            const state = readConductorState(testDir);
            expect(state).toBeNull();
        });
        it('should return parsed state when file exists', () => {
            const state = initConductor(testDir);
            const readState = readConductorState(testDir);
            expect(readState).not.toBeNull();
            expect(readState?.active).toBe(true);
        });
        it('should handle session-scoped state', () => {
            const sessionId = 'test-session-123';
            const state = initConductor(testDir, sessionId);
            const readState = readConductorState(testDir, sessionId);
            expect(readState).not.toBeNull();
            expect(readState?.session_id).toBe(sessionId);
        });
        it('should return null for mismatched session id', () => {
            const sessionId = 'test-session-123';
            initConductor(testDir, sessionId);
            const readState = readConductorState(testDir, 'different-session');
            expect(readState).toBeNull();
        });
        it('should handle legacy path when no sessionId provided', () => {
            const state = initConductor(testDir);
            const readState = readConductorState(testDir);
            expect(readState).not.toBeNull();
            expect(readState?.active).toBe(true);
        });
        it('should return null on corrupted state file', () => {
            const state = initConductor(testDir);
            const stateFile = join(testDir, '.omc', 'conductor', 'conductor-state.json');
            // Corrupt the file by writing invalid JSON
            const fs = require('fs');
            fs.writeFileSync(stateFile, 'invalid json{', 'utf-8');
            const readState = readConductorState(testDir);
            expect(readState).toBeNull();
        });
    });
    describe('writeConductorState', () => {
        it('should write state atomically', () => {
            const state = initConductor(testDir);
            const result = writeConductorState(testDir, state);
            expect(result).toBe(true);
            const readState = readConductorState(testDir);
            expect(readState).not.toBeNull();
        });
        it('should update lastWriteAt timestamp', () => {
            const state = initConductor(testDir);
            const originalTime = state._meta.lastWriteAt;
            // Wait a bit to ensure timestamp changes
            vi.useFakeTimers();
            vi.advanceTimersByTime(1000);
            writeConductorState(testDir, state);
            vi.useRealTimers();
            const readState = readConductorState(testDir);
            expect(readState?._meta.lastWriteAt).not.toBe(originalTime);
        });
        it('should create state directory if it does not exist', () => {
            const state = initConductor(testDir);
            clearConductorState(testDir);
            // Remove the directory
            rmSync(join(testDir, '.omc'), { recursive: true, force: true });
            const result = writeConductorState(testDir, state);
            expect(result).toBe(true);
            expect(existsSync(join(testDir, '.omc', 'conductor'))).toBe(true);
        });
        it('should handle session-scoped writes', () => {
            const sessionId = 'test-session-456';
            const state = initConductor(testDir, sessionId);
            const result = writeConductorState(testDir, state, sessionId);
            expect(result).toBe(true);
            const readState = readConductorState(testDir, sessionId);
            expect(readState).not.toBeNull();
            expect(readState?.session_id).toBe(sessionId);
        });
    });
    describe('clearConductorState', () => {
        it('should delete state file', () => {
            initConductor(testDir);
            expect(isConductorActive(testDir)).toBe(true);
            clearConductorState(testDir);
            expect(isConductorActive(testDir)).toBe(false);
        });
        it('should return true if file already missing', () => {
            const result = clearConductorState(testDir);
            expect(result).toBe(true);
        });
        it('should clear session-scoped state', () => {
            const sessionId = 'test-session-789';
            initConductor(testDir, sessionId);
            expect(isConductorActive(testDir, sessionId)).toBe(true);
            clearConductorState(testDir, sessionId);
            expect(isConductorActive(testDir, sessionId)).toBe(false);
        });
    });
    describe('initConductor', () => {
        it('should create new state with correct defaults', () => {
            const state = initConductor(testDir);
            expect(state).not.toBeNull();
            expect(state.active).toBe(true);
            expect(state.activeTrack).toBeNull();
            expect(state.tracks).toEqual({});
            expect(state.context.productDefinition).toBeNull();
            expect(state.context.techStackPath).toBeNull();
            expect(state.context.workflowPath).toBeNull();
            expect(state.context.styleguides).toEqual([]);
            expect(state.context.bootstrappedFromProjectMemory).toBe(false);
            expect(state._meta.version).toBe('1.0.0');
        });
        it('should create conductor directory structure', () => {
            initConductor(testDir);
            expect(existsSync(join(testDir, '.omc', 'conductor'))).toBe(true);
            expect(existsSync(join(testDir, '.omc', 'conductor', 'specs'))).toBe(true);
            expect(existsSync(join(testDir, '.omc', 'conductor', 'plans'))).toBe(true);
            expect(existsSync(join(testDir, '.omc', 'conductor', 'reviews'))).toBe(true);
        });
        it('should initialize with session id', () => {
            const sessionId = 'test-session-init';
            const state = initConductor(testDir, sessionId);
            expect(state.session_id).toBe(sessionId);
        });
        it('should allow init when autopilot state exists (conductor is non-exclusive)', () => {
            // Create a conflicting mode state (e.g., autopilot)
            const autopilotStateDir = join(testDir, '.omc', 'state');
            const fs = require('fs');
            fs.mkdirSync(autopilotStateDir, { recursive: true });
            fs.writeFileSync(join(autopilotStateDir, 'autopilot-state.json'), JSON.stringify({ active: true }), 'utf-8');
            expect(() => initConductor(testDir)).not.toThrow();
            const state = readConductorState(testDir);
            expect(state?.active).toBe(true);
        });
    });
    describe('createTrack', () => {
        beforeEach(() => {
            initConductor(testDir);
        });
        it('should create new track with slug from title', () => {
            const track = createTrack(testDir, 'Add User Authentication', 'Implement OAuth login');
            expect(track.slug).toBe('add-user-authentication');
            expect(track.title).toBe('Add User Authentication');
            expect(track.description).toBe('Implement OAuth login');
            expect(track.status).toBe('spec');
            expect(track.phase).toBe('spec');
            expect(track.tasks).toEqual([]);
            expect(track.currentTaskIndex).toBe(0);
        });
        it('should generate URL-safe slug', () => {
            const track = createTrack(testDir, 'Fix Bug #123 (Critical!)', 'Description');
            expect(track.slug).toBe('fix-bug-123-critical');
        });
        it('should set track as active', () => {
            const track = createTrack(testDir, 'New Feature', 'Description');
            const state = readConductorState(testDir);
            expect(state?.activeTrack).toBe(track.slug);
            expect(state?.tracks[track.slug]).toEqual(track);
        });
        it('should throw error if conductor not initialized', () => {
            clearConductorState(testDir);
            expect(() => createTrack(testDir, 'Feature', 'Desc')).toThrow('Conductor not initialized');
        });
        it('should throw error for duplicate slug', () => {
            createTrack(testDir, 'Same Feature', 'First description');
            expect(() => createTrack(testDir, 'Same Feature', 'Second description')).toThrow('already exists');
        });
        it('should handle session-scoped track creation', () => {
            clearConductorState(testDir);
            const sessionId = 'track-session';
            initConductor(testDir, sessionId);
            const track = createTrack(testDir, 'Session Track', 'Description', sessionId);
            expect(track.slug).toBe('session-track');
            const readTrack = getTrack(testDir, track.slug, sessionId);
            expect(readTrack).not.toBeNull();
            expect(readTrack?.title).toBe('Session Track');
        });
    });
    describe('getTrack', () => {
        beforeEach(() => {
            initConductor(testDir);
        });
        it('should retrieve track by slug', () => {
            const created = createTrack(testDir, 'Feature A', 'Description A');
            const retrieved = getTrack(testDir, created.slug);
            expect(retrieved).not.toBeNull();
            expect(retrieved?.slug).toBe(created.slug);
            expect(retrieved?.title).toBe('Feature A');
        });
        it('should return null for non-existent slug', () => {
            const track = getTrack(testDir, 'non-existent-slug');
            expect(track).toBeNull();
        });
        it('should return null if conductor not initialized', () => {
            clearConductorState(testDir);
            const track = getTrack(testDir, 'any-slug');
            expect(track).toBeNull();
        });
    });
    describe('updateTrack', () => {
        beforeEach(() => {
            initConductor(testDir);
        });
        it('should update track fields', () => {
            const track = createTrack(testDir, 'Feature', 'Description');
            const result = updateTrack(testDir, track.slug, {
                status: 'in_progress',
                phase: 'implementing',
                gitBranch: 'feature/my-branch'
            });
            expect(result).toBe(true);
            const updated = getTrack(testDir, track.slug);
            expect(updated?.status).toBe('in_progress');
            expect(updated?.phase).toBe('implementing');
            expect(updated?.gitBranch).toBe('feature/my-branch');
        });
        it('should update updatedAt timestamp', () => {
            const track = createTrack(testDir, 'Feature', 'Description');
            const originalTime = track.updatedAt;
            vi.useFakeTimers();
            vi.advanceTimersByTime(1000);
            updateTrack(testDir, track.slug, { status: 'planned' });
            vi.useRealTimers();
            const updated = getTrack(testDir, track.slug);
            expect(updated?.updatedAt).not.toBe(originalTime);
        });
        it('should return false for non-existent track', () => {
            const result = updateTrack(testDir, 'non-existent', { status: 'done' });
            expect(result).toBe(false);
        });
        it('should return false if conductor not initialized', () => {
            clearConductorState(testDir);
            const result = updateTrack(testDir, 'slug', { status: 'done' });
            expect(result).toBe(false);
        });
    });
    describe('updateContext', () => {
        beforeEach(() => {
            initConductor(testDir);
        });
        it('should update context fields', () => {
            const result = updateContext(testDir, {
                productDefinition: '/path/to/product.md',
                techStackPath: '/path/to/tech-stack.md',
                bootstrappedFromProjectMemory: true
            });
            expect(result).toBe(true);
            const state = readConductorState(testDir);
            expect(state?.context.productDefinition).toBe('/path/to/product.md');
            expect(state?.context.techStackPath).toBe('/path/to/tech-stack.md');
            expect(state?.context.bootstrappedFromProjectMemory).toBe(true);
        });
        it('should return false if conductor not initialized', () => {
            clearConductorState(testDir);
            const result = updateContext(testDir, { productDefinition: '/path' });
            expect(result).toBe(false);
        });
    });
    describe('setActiveTrack', () => {
        beforeEach(() => {
            initConductor(testDir);
        });
        it('should set active track', () => {
            const track = createTrack(testDir, 'Feature', 'Description');
            const result = setActiveTrack(testDir, track.slug);
            expect(result).toBe(true);
            const state = readConductorState(testDir);
            expect(state?.activeTrack).toBe(track.slug);
        });
        it('should allow clearing active track', () => {
            createTrack(testDir, 'Feature', 'Description');
            const result = setActiveTrack(testDir, null);
            expect(result).toBe(true);
            const state = readConductorState(testDir);
            expect(state?.activeTrack).toBeNull();
        });
        it('should return false for non-existent track', () => {
            const result = setActiveTrack(testDir, 'non-existent');
            expect(result).toBe(false);
        });
        it('should return false if conductor not initialized', () => {
            clearConductorState(testDir);
            const result = setActiveTrack(testDir, 'slug');
            expect(result).toBe(false);
        });
    });
    describe('addTrackTask', () => {
        beforeEach(() => {
            initConductor(testDir);
        });
        it('should add task to track', () => {
            const track = createTrack(testDir, 'Feature', 'Description');
            const task = addTrackTask(testDir, track.slug, 'Implement login form');
            expect(task).not.toBeNull();
            expect(task?.id).toBe(`${track.slug}-task-1`);
            expect(task?.description).toBe('Implement login form');
            expect(task?.status).toBe('spec');
            expect(task?.files).toEqual([]);
            expect(task?.completedAt).toBeNull();
        });
        it('should increment task id for multiple tasks', () => {
            const track = createTrack(testDir, 'Feature', 'Description');
            const task1 = addTrackTask(testDir, track.slug, 'Task 1');
            const task2 = addTrackTask(testDir, track.slug, 'Task 2');
            expect(task1?.id).toBe(`${track.slug}-task-1`);
            expect(task2?.id).toBe(`${track.slug}-task-2`);
            const updated = getTrack(testDir, track.slug);
            expect(updated?.tasks.length).toBe(2);
        });
        it('should return null for non-existent track', () => {
            const task = addTrackTask(testDir, 'non-existent', 'Task');
            expect(task).toBeNull();
        });
        it('should return null if conductor not initialized', () => {
            clearConductorState(testDir);
            const task = addTrackTask(testDir, 'slug', 'Task');
            expect(task).toBeNull();
        });
    });
    describe('updateTrackTask', () => {
        beforeEach(() => {
            initConductor(testDir);
        });
        it('should update task fields', () => {
            const track = createTrack(testDir, 'Feature', 'Description');
            const task = addTrackTask(testDir, track.slug, 'Task');
            const result = updateTrackTask(testDir, track.slug, task.id, {
                status: 'in_progress',
                files: ['file1.ts', 'file2.ts']
            });
            expect(result).toBe(true);
            const updated = getTrack(testDir, track.slug);
            const updatedTask = updated?.tasks.find(t => t.id === task.id);
            expect(updatedTask?.status).toBe('in_progress');
            expect(updatedTask?.files).toEqual(['file1.ts', 'file2.ts']);
        });
        it('should return false for non-existent task', () => {
            const track = createTrack(testDir, 'Feature', 'Description');
            const result = updateTrackTask(testDir, track.slug, 'non-existent-task', {
                status: 'done'
            });
            expect(result).toBe(false);
        });
        it('should return false for non-existent track', () => {
            const result = updateTrackTask(testDir, 'non-existent', 'task-id', {
                status: 'done'
            });
            expect(result).toBe(false);
        });
    });
    describe('getAllTracks', () => {
        beforeEach(() => {
            initConductor(testDir);
        });
        it('should return all tracks', () => {
            createTrack(testDir, 'Feature A', 'Desc A');
            createTrack(testDir, 'Feature B', 'Desc B');
            createTrack(testDir, 'Feature C', 'Desc C');
            const tracks = getAllTracks(testDir);
            expect(tracks.length).toBe(3);
        });
        it('should return empty array if no tracks', () => {
            const tracks = getAllTracks(testDir);
            expect(tracks).toEqual([]);
        });
        it('should return empty array if conductor not initialized', () => {
            clearConductorState(testDir);
            const tracks = getAllTracks(testDir);
            expect(tracks).toEqual([]);
        });
    });
    describe('getTracksByStatus', () => {
        beforeEach(() => {
            initConductor(testDir);
        });
        it('should filter tracks by status', () => {
            const track1 = createTrack(testDir, 'Feature A', 'Desc A');
            const track2 = createTrack(testDir, 'Feature B', 'Desc B');
            const track3 = createTrack(testDir, 'Feature C', 'Desc C');
            updateTrack(testDir, track2.slug, { status: 'in_progress' });
            updateTrack(testDir, track3.slug, { status: 'done' });
            const specTracks = getTracksByStatus(testDir, 'spec');
            const inProgressTracks = getTracksByStatus(testDir, 'in_progress');
            const doneTracks = getTracksByStatus(testDir, 'done');
            expect(specTracks.length).toBe(1);
            expect(inProgressTracks.length).toBe(1);
            expect(doneTracks.length).toBe(1);
        });
        it('should return empty array if no matching tracks', () => {
            createTrack(testDir, 'Feature', 'Description');
            const tracks = getTracksByStatus(testDir, 'done');
            expect(tracks).toEqual([]);
        });
    });
    describe('isConductorActive', () => {
        it('should return false if not initialized', () => {
            expect(isConductorActive(testDir)).toBe(false);
        });
        it('should return true if initialized and active', () => {
            initConductor(testDir);
            expect(isConductorActive(testDir)).toBe(true);
        });
        it('should return false if deactivated', () => {
            initConductor(testDir);
            deactivateConductor(testDir);
            expect(isConductorActive(testDir)).toBe(false);
        });
    });
    describe('deactivateConductor', () => {
        it('should deactivate conductor', () => {
            initConductor(testDir);
            expect(isConductorActive(testDir)).toBe(true);
            const result = deactivateConductor(testDir);
            expect(result).toBe(true);
            expect(isConductorActive(testDir)).toBe(false);
        });
        it('should return false if not initialized', () => {
            const result = deactivateConductor(testDir);
            expect(result).toBe(false);
        });
    });
    describe('path helpers', () => {
        it('should return correct spec path', () => {
            const path = getSpecPath(testDir, 'my-feature');
            expect(path).toBe(join(testDir, '.omc', 'conductor', 'specs', 'my-feature.md'));
        });
        it('should return correct plan path', () => {
            const path = getPlanPath(testDir, 'my-feature');
            expect(path).toBe(join(testDir, '.omc', 'conductor', 'plans', 'my-feature.md'));
        });
        it('should return correct review path', () => {
            const path = getReviewPath(testDir, 'my-feature');
            expect(path).toBe(join(testDir, '.omc', 'conductor', 'reviews', 'my-feature.md'));
        });
    });
    describe('ensureConductorDirs', () => {
        it('should create all required directories', () => {
            ensureConductorDirs(testDir);
            expect(existsSync(join(testDir, '.omc', 'conductor'))).toBe(true);
            expect(existsSync(join(testDir, '.omc', 'conductor', 'specs'))).toBe(true);
            expect(existsSync(join(testDir, '.omc', 'conductor', 'plans'))).toBe(true);
            expect(existsSync(join(testDir, '.omc', 'conductor', 'reviews'))).toBe(true);
        });
        it('should not fail if directories already exist', () => {
            ensureConductorDirs(testDir);
            // Call again
            expect(() => ensureConductorDirs(testDir)).not.toThrow();
        });
    });
    describe('session isolation', () => {
        it('should isolate state between sessions', () => {
            const session1 = 'session-1';
            const session2 = 'session-2';
            initConductor(testDir, session1);
            initConductor(testDir, session2);
            createTrack(testDir, 'Feature A', 'Description A', session1);
            createTrack(testDir, 'Feature B', 'Description B', session2);
            const tracks1 = getAllTracks(testDir, session1);
            const tracks2 = getAllTracks(testDir, session2);
            expect(tracks1.length).toBe(1);
            expect(tracks2.length).toBe(1);
            expect(tracks1[0].title).toBe('Feature A');
            expect(tracks2[0].title).toBe('Feature B');
        });
        it('should not mix session and legacy states', () => {
            const sessionId = 'session-abc';
            initConductor(testDir);
            initConductor(testDir, sessionId);
            createTrack(testDir, 'Legacy Track', 'Legacy');
            createTrack(testDir, 'Session Track', 'Session', sessionId);
            const legacyTracks = getAllTracks(testDir);
            const sessionTracks = getAllTracks(testDir, sessionId);
            expect(legacyTracks.length).toBe(1);
            expect(sessionTracks.length).toBe(1);
            expect(legacyTracks[0].title).toBe('Legacy Track');
            expect(sessionTracks[0].title).toBe('Session Track');
        });
    });
});
//# sourceMappingURL=state.test.js.map