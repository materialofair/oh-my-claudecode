/**
 * Shared MCP execution helpers
 *
 * Pure helper functions used by both codex-core.ts and gemini-core.ts
 * to eliminate duplicated stdout truncation and output file writing logic.
 */
export declare const TRUNCATION_MARKER = "\n\n[OUTPUT TRUNCATED: exceeded 10MB limit]";
/**
 * Creates a streaming stdout collector that accumulates output up to maxBytes.
 * Once the limit is exceeded, further chunks are ignored and a truncation
 * marker is appended exactly once.
 */
export declare function createStdoutCollector(maxBytes: number): {
    append(chunk: string): void;
    toString(): string;
    readonly isTruncated: boolean;
};
/**
 * Safely write content to an output file, ensuring the path stays within
 * the base directory boundary (symlink-safe).
 *
 * @returns An MCP-style error response on failure, or null on success.
 */
export declare function safeWriteOutputFile(outputFile: string, content: string, baseDirReal: string, logPrefix?: string): Promise<{
    isError: true;
    content: {
        type: string;
        text: string;
    }[];
} | null>;
//# sourceMappingURL=shared-exec.d.ts.map