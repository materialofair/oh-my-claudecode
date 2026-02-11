/**
 * Conductor Review
 *
 * Handles track review by computing git diffs and delegating to
 * code-reviewer and security-reviewer agents.
 */
import { existsSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { getTrack, getReviewPath } from './state.js';
import { loadContext } from './context.js';
/**
 * Get git diff between track start and current HEAD
 *
 * @param directory - Project root directory
 * @param gitStartCommit - Starting commit hash
 * @returns Git diff output
 */
function getGitDiff(directory, gitStartCommit) {
    try {
        const diff = execSync(`git diff ${gitStartCommit}..HEAD`, { cwd: directory, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
        return diff;
    }
    catch (error) {
        throw new Error(`Failed to get git diff: ${error.message}`);
    }
}
/**
 * Get list of changed files
 *
 * @param directory - Project root directory
 * @param gitStartCommit - Starting commit hash
 * @returns Array of changed file paths
 */
function getChangedFiles(directory, gitStartCommit) {
    try {
        const output = execSync(`git diff --name-only ${gitStartCommit}..HEAD`, { cwd: directory, encoding: 'utf-8' });
        return output.trim().split('\n').filter(line => line.length > 0);
    }
    catch (error) {
        throw new Error(`Failed to get changed files: ${error.message}`);
    }
}
/**
 * Get commit messages between track start and HEAD
 *
 * @param directory - Project root directory
 * @param gitStartCommit - Starting commit hash
 * @returns Array of commit messages
 */
function getCommitMessages(directory, gitStartCommit) {
    try {
        const output = execSync(`git log ${gitStartCommit}..HEAD --pretty=format:"%h - %s (%an, %ar)"`, { cwd: directory, encoding: 'utf-8' });
        return output.trim().split('\n').filter(line => line.length > 0);
    }
    catch (error) {
        throw new Error(`Failed to get commit messages: ${error.message}`);
    }
}
/**
 * Generate review prompt for agents
 *
 * Creates a comprehensive prompt including context, spec, plan, and diff.
 *
 * @param directory - Project root directory
 * @param track - Track being reviewed
 * @param diff - Git diff output
 * @param changedFiles - List of changed files
 * @param commits - List of commit messages
 * @returns Prompt string for review agents
 */
function generateReviewPrompt(directory, track, diff, changedFiles, commits) {
    const context = loadContext(directory);
    const sections = [];
    sections.push('# TRACK REVIEW REQUEST\n');
    sections.push(`Track: ${track.title}`);
    sections.push(`Slug: ${track.slug}`);
    sections.push(`Status: ${track.status}\n`);
    sections.push('## Track Description\n');
    sections.push(track.description);
    sections.push('\n---\n');
    // Include context
    sections.push(context);
    sections.push('\n---\n');
    // Include spec if available
    if (track.specPath && existsSync(track.specPath)) {
        sections.push('## SPECIFICATION\n');
        const spec = require('fs').readFileSync(track.specPath, 'utf-8');
        sections.push(spec);
        sections.push('\n---\n');
    }
    // Include plan if available
    if (track.planPath && existsSync(track.planPath)) {
        sections.push('## IMPLEMENTATION PLAN\n');
        const plan = require('fs').readFileSync(track.planPath, 'utf-8');
        sections.push(plan);
        sections.push('\n---\n');
    }
    // Show commit history
    sections.push('## COMMIT HISTORY\n');
    if (commits.length > 0) {
        sections.push(commits.join('\n'));
    }
    else {
        sections.push('No commits yet.');
    }
    sections.push('\n---\n');
    // Show changed files
    sections.push('## CHANGED FILES\n');
    sections.push(changedFiles.join('\n'));
    sections.push('\n---\n');
    // Include diff
    sections.push('## GIT DIFF\n');
    sections.push('```diff');
    sections.push(diff);
    sections.push('```\n');
    sections.push('\n---\n');
    // Review instructions
    sections.push('## REVIEW INSTRUCTIONS\n');
    sections.push('Please review this implementation and provide feedback on:\n');
    sections.push('1. **Completeness**: Does it fully implement the spec?');
    sections.push('2. **Quality**: Is the code well-structured and maintainable?');
    sections.push('3. **Testing**: Are tests adequate and comprehensive?');
    sections.push('4. **Security**: Are there any security concerns?');
    sections.push('5. **Performance**: Are there any performance issues?');
    sections.push('6. **Breaking Changes**: Does this introduce any breaking changes?\n');
    sections.push('Provide specific actionable feedback with file:line references.');
    return sections.join('\n');
}
/**
 * Write review results to markdown file
 *
 * @param reviewPath - Path to review.md file
 * @param track - Track being reviewed
 * @param codeReview - Code review results
 * @param securityReview - Security review results
 */
function writeReviewDocument(reviewPath, track, codeReview, securityReview) {
    const sections = [];
    sections.push(`# Review: ${track.title}\n`);
    sections.push(`Track: ${track.slug}`);
    sections.push(`Reviewed: ${new Date().toISOString()}\n`);
    sections.push('---\n');
    sections.push('## Code Review\n');
    sections.push(codeReview);
    sections.push('\n---\n');
    sections.push('## Security Review\n');
    sections.push(securityReview);
    sections.push('\n---\n');
    sections.push('## Recommendation\n');
    sections.push('[To be determined based on review findings]\n');
    sections.push('- [ ] Approved for merge');
    sections.push('- [ ] Requires changes');
    sections.push('- [ ] Reject and revert\n');
    writeFileSync(reviewPath, sections.join('\n'), 'utf-8');
}
/**
 * Review a track
 *
 * Computes git diff from gitStartCommit to HEAD, loads context/spec/plan,
 * delegates to code-reviewer and security-reviewer agents, and writes
 * review.md to the track directory.
 *
 * @param directory - Project root directory
 * @param slug - Track slug
 * @param sessionId - Optional session ID
 * @returns Review results object
 */
export async function reviewTrack(directory, slug, sessionId) {
    try {
        // Load track
        const track = getTrack(directory, slug, sessionId);
        if (!track) {
            return { success: false, error: `Track "${slug}" not found.` };
        }
        // Verify track has a git start commit
        if (!track.gitStartCommit) {
            return {
                success: false,
                error: 'Track has no git start commit. Cannot compute diff.'
            };
        }
        // Get git diff and changed files
        const diff = getGitDiff(directory, track.gitStartCommit);
        const changedFiles = getChangedFiles(directory, track.gitStartCommit);
        const commits = getCommitMessages(directory, track.gitStartCommit);
        if (changedFiles.length === 0) {
            return {
                success: false,
                error: 'No changes detected. Nothing to review.'
            };
        }
        // Generate review prompt
        const prompt = generateReviewPrompt(directory, track, diff, changedFiles, commits);
        // NOTE: In a real implementation, this would delegate to agents:
        // const codeReview = await delegateToAgent('oh-my-claudecode:code-reviewer', prompt);
        // const securityReview = await delegateToAgent('oh-my-claudecode:security-reviewer', prompt);
        //
        // For now, we'll create placeholder reviews indicating delegation is needed
        const codeReview = `[Code Review Placeholder]

This review should be performed by the code-reviewer agent with the following prompt:

${prompt}

The agent should analyze:
- Code quality and maintainability
- Test coverage and quality
- Adherence to style guides
- API design and breaking changes
- Documentation completeness`;
        const securityReview = `[Security Review Placeholder]

This review should be performed by the security-reviewer agent with the following prompt:

${prompt}

The agent should analyze:
- Input validation and sanitization
- Authentication and authorization
- Sensitive data handling
- Dependency vulnerabilities
- Common security anti-patterns (SQL injection, XSS, etc.)`;
        // Write review document
        const reviewPath = getReviewPath(directory, slug);
        writeReviewDocument(reviewPath, track, codeReview, securityReview);
        return {
            success: true,
            reviewPath
        };
    }
    catch (error) {
        return {
            success: false,
            error: `Review failed: ${error.message}`
        };
    }
}
//# sourceMappingURL=review.js.map