/**
 * Conductor Context Management
 *
 * Handles initialization and loading of conductor context including:
 * - Product definition
 * - Tech stack documentation (bootstrapped from project-memory)
 * - Workflow guidelines
 * - Style guides
 */
import type { ConductorContext } from './types.js';
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
export declare function bootstrapFromProjectMemory(directory: string): string;
/**
 * Generate product.md from user description
 *
 * Creates a product definition document from the user's description.
 *
 * @param directory - Project root directory (unused, but included for consistency)
 * @param description - User-provided product description
 * @returns Markdown string for product.md
 */
export declare function generateProductMd(directory: string, description: string): string;
/**
 * Generate workflow.md from guidelines
 *
 * Creates a workflow guidelines document.
 *
 * @param directory - Project root directory (unused, but included for consistency)
 * @param guidelines - Optional custom workflow guidelines
 * @returns Markdown string for workflow.md
 */
export declare function generateWorkflowMd(directory: string, guidelines?: string): string;
/**
 * Load all context files and combine into a single string
 *
 * Reads product.md, tech-stack.md, workflow.md, and any styleguides,
 * then combines them into a single context string for agent prompts.
 *
 * @param directory - Project root directory
 * @returns Combined context string
 */
export declare function loadContext(directory: string): string;
/**
 * Check if conductor context is initialized
 *
 * Verifies that the context directory exists and contains the required files.
 *
 * @param directory - Project root directory
 * @returns true if context is initialized, false otherwise
 */
export declare function isContextInitialized(directory: string): boolean;
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
export declare function initializeContext(directory: string, productDescription: string, workflowGuidelines?: string): ConductorContext;
//# sourceMappingURL=context.d.ts.map