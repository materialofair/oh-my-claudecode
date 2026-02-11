/**
 * Conductor Context Management
 *
 * Handles initialization and loading of conductor context including:
 * - Product definition
 * - Tech stack documentation (bootstrapped from project-memory)
 * - Workflow guidelines
 * - Style guides
 */
import { existsSync, readFileSync, mkdirSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
/**
 * Path to conductor context directory within .omc
 */
function getContextDir(directory) {
    return join(directory, '.omc', 'conductor', 'context');
}
/**
 * Bootstrap tech-stack.md from project-memory.json
 *
 * Reads the project memory and generates a markdown document containing:
 * - Languages (name, version)
 * - Frameworks (name, version, category)
 * - Build commands (build, test, lint)
 *
 * @param directory - Project root directory
 * @returns Markdown string for tech-stack.md
 */
export function bootstrapFromProjectMemory(directory) {
    const projectMemoryPath = join(directory, '.omc', 'project-memory.json');
    if (!existsSync(projectMemoryPath)) {
        throw new Error('Project memory not found. Run project memory scan first.');
    }
    const projectMemory = JSON.parse(readFileSync(projectMemoryPath, 'utf-8'));
    const { techStack, build } = projectMemory;
    // Build markdown sections
    const sections = [];
    // Header
    sections.push('# Tech Stack\n');
    sections.push('> Auto-generated from project-memory.json\n');
    // Languages section
    if (techStack.languages.length > 0) {
        sections.push('## Languages\n');
        techStack.languages.forEach(lang => {
            const version = lang.version ? ` (${lang.version})` : '';
            const confidence = lang.confidence !== 'high' ? ` [${lang.confidence} confidence]` : '';
            sections.push(`- **${lang.name}**${version}${confidence}`);
            if (lang.markers.length > 0) {
                sections.push(`  - Detected via: ${lang.markers.join(', ')}`);
            }
        });
        sections.push('');
    }
    // Frameworks section
    if (techStack.frameworks.length > 0) {
        sections.push('## Frameworks\n');
        const byCategory = {};
        techStack.frameworks.forEach(fw => {
            if (!byCategory[fw.category]) {
                byCategory[fw.category] = [];
            }
            byCategory[fw.category].push(fw);
        });
        Object.entries(byCategory).forEach(([category, frameworks]) => {
            sections.push(`### ${category.charAt(0).toUpperCase() + category.slice(1)}\n`);
            frameworks.forEach(fw => {
                const version = fw.version ? ` (${fw.version})` : '';
                sections.push(`- **${fw.name}**${version}`);
            });
            sections.push('');
        });
    }
    // Package manager and runtime
    if (techStack.packageManager || techStack.runtime) {
        sections.push('## Package Management & Runtime\n');
        if (techStack.packageManager) {
            sections.push(`- **Package Manager:** ${techStack.packageManager}`);
        }
        if (techStack.runtime) {
            sections.push(`- **Runtime:** ${techStack.runtime}`);
        }
        sections.push('');
    }
    // Build commands section
    if (build.buildCommand || build.testCommand || build.lintCommand || build.devCommand) {
        sections.push('## Build Commands\n');
        if (build.buildCommand) {
            sections.push(`**Build:**\n\`\`\`bash\n${build.buildCommand}\n\`\`\`\n`);
        }
        if (build.testCommand) {
            sections.push(`**Test:**\n\`\`\`bash\n${build.testCommand}\n\`\`\`\n`);
        }
        if (build.lintCommand) {
            sections.push(`**Lint:**\n\`\`\`bash\n${build.lintCommand}\n\`\`\`\n`);
        }
        if (build.devCommand) {
            sections.push(`**Dev:**\n\`\`\`bash\n${build.devCommand}\n\`\`\`\n`);
        }
    }
    // Additional scripts (if many exist, summarize)
    const scriptCount = Object.keys(build.scripts).length;
    if (scriptCount > 0) {
        sections.push(`## Available Scripts\n`);
        sections.push(`Project defines ${scriptCount} npm/package scripts. Check package.json for full list.\n`);
    }
    return sections.join('\n');
}
/**
 * Generate product.md from user description
 *
 * Creates a product definition document from the user's description.
 *
 * @param directory - Project root directory (unused, but included for consistency)
 * @param description - User-provided product description
 * @returns Markdown string for product.md
 */
export function generateProductMd(directory, description) {
    return `# Product Definition

${description}

## Purpose

This document defines the product's purpose, target users, and core functionality.
It serves as the reference point for all conductor tracks.

## Target Users

[To be defined based on product requirements]

## Core Features

[To be defined as tracks are created]
`;
}
/**
 * Generate workflow.md from guidelines
 *
 * Creates a workflow guidelines document.
 *
 * @param directory - Project root directory (unused, but included for consistency)
 * @param guidelines - Optional custom workflow guidelines
 * @returns Markdown string for workflow.md
 */
export function generateWorkflowMd(directory, guidelines) {
    const defaultGuidelines = `# Workflow Guidelines

## Development Process

1. **Spec Phase**: Product Manager defines the feature requirements
   - What problem does this solve?
   - Who are the users?
   - What are the acceptance criteria?

2. **Planning Phase**: Architect creates the implementation plan
   - Technical approach
   - Files to modify/create
   - Dependencies and risks
   - Breaking down into tasks

3. **Implementation Phase**: Executor builds the feature
   - Follow the plan
   - Write tests alongside code
   - Keep commits atomic and well-documented

4. **Review Phase**: Quality Reviewer verifies the implementation
   - Does it meet the spec?
   - Are tests comprehensive?
   - Is the code maintainable?

## Best Practices

- **Keep tracks focused**: Each track should deliver one cohesive feature
- **Write clear specs**: The better the spec, the smoother implementation
- **Plan thoroughly**: Good plans prevent rework
- **Test as you go**: Don't leave testing for later
- **Review rigorously**: Quality review catches issues before they ship

## Git Workflow

- Each track gets its own branch (conductor/track-slug)
- Commit frequently with clear messages
- Squash commits before merging to main
- Keep main branch always deployable
`;
    if (guidelines) {
        return `${defaultGuidelines}

## Custom Guidelines

${guidelines}
`;
    }
    return defaultGuidelines;
}
/**
 * Load all context files and combine into a single string
 *
 * Reads product.md, tech-stack.md, workflow.md, and any styleguides,
 * then combines them into a single context string for agent prompts.
 *
 * @param directory - Project root directory
 * @returns Combined context string
 */
export function loadContext(directory) {
    const contextDir = getContextDir(directory);
    if (!existsSync(contextDir)) {
        throw new Error('Conductor context not initialized. Run /conductor setup first.');
    }
    const sections = [];
    // Load product definition
    const productPath = join(contextDir, 'product.md');
    if (existsSync(productPath)) {
        sections.push('# PRODUCT DEFINITION\n');
        sections.push(readFileSync(productPath, 'utf-8'));
        sections.push('\n---\n');
    }
    // Load tech stack
    const techStackPath = join(contextDir, 'tech-stack.md');
    if (existsSync(techStackPath)) {
        sections.push('# TECH STACK\n');
        sections.push(readFileSync(techStackPath, 'utf-8'));
        sections.push('\n---\n');
    }
    // Load workflow
    const workflowPath = join(contextDir, 'workflow.md');
    if (existsSync(workflowPath)) {
        sections.push('# WORKFLOW\n');
        sections.push(readFileSync(workflowPath, 'utf-8'));
        sections.push('\n---\n');
    }
    // Load styleguides
    const styleguideDir = join(contextDir, 'styleguides');
    if (existsSync(styleguideDir)) {
        const styleguideFiles = readdirSync(styleguideDir)
            .filter(f => f.endsWith('.md'))
            .sort();
        if (styleguideFiles.length > 0) {
            sections.push('# STYLE GUIDES\n');
            styleguideFiles.forEach(file => {
                const filePath = join(styleguideDir, file);
                const name = file.replace('.md', '').replace(/-/g, ' ').toUpperCase();
                sections.push(`## ${name}\n`);
                sections.push(readFileSync(filePath, 'utf-8'));
                sections.push('\n');
            });
            sections.push('---\n');
        }
    }
    return sections.join('\n');
}
/**
 * Check if conductor context is initialized
 *
 * Verifies that the context directory exists and contains the required files.
 *
 * @param directory - Project root directory
 * @returns true if context is initialized, false otherwise
 */
export function isContextInitialized(directory) {
    const contextDir = getContextDir(directory);
    if (!existsSync(contextDir)) {
        return false;
    }
    // Check for required files
    const productPath = join(contextDir, 'product.md');
    const techStackPath = join(contextDir, 'tech-stack.md');
    return existsSync(productPath) && existsSync(techStackPath);
}
/**
 * Initialize conductor context directory and files
 *
 * Creates the context directory structure and generates initial files:
 * - tech-stack.md (from project memory)
 * - product.md (from user description)
 * - workflow.md (default or custom)
 * - styleguides/ (empty directory for user to populate)
 *
 * @param directory - Project root directory
 * @param productDescription - User-provided product description
 * @param workflowGuidelines - Optional custom workflow guidelines
 * @returns ConductorContext object with paths to created files
 */
export function initializeContext(directory, productDescription, workflowGuidelines) {
    const contextDir = getContextDir(directory);
    // Create context directory structure
    mkdirSync(contextDir, { recursive: true });
    const styleguideDir = join(contextDir, 'styleguides');
    mkdirSync(styleguideDir, { recursive: true });
    // Generate and write tech-stack.md
    const techStackMd = bootstrapFromProjectMemory(directory);
    const techStackPath = join(contextDir, 'tech-stack.md');
    writeFileSync(techStackPath, techStackMd, 'utf-8');
    // Generate and write product.md
    const productMd = generateProductMd(directory, productDescription);
    const productPath = join(contextDir, 'product.md');
    writeFileSync(productPath, productMd, 'utf-8');
    // Generate and write workflow.md
    const workflowMd = generateWorkflowMd(directory, workflowGuidelines);
    const workflowPath = join(contextDir, 'workflow.md');
    writeFileSync(workflowPath, workflowMd, 'utf-8');
    // Return context object
    return {
        productDefinition: productPath,
        techStackPath,
        workflowPath,
        styleguides: [],
        initializedAt: new Date().toISOString(),
        bootstrappedFromProjectMemory: true
    };
}
//# sourceMappingURL=context.js.map