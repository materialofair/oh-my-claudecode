import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import type { CoverageAnalysisResult, GapAnalysisResult, CoverageGap } from './types.js';

interface AnalyzeCoverageOptions {
  projectRoot: string;
  coverageData?: any;
}

export async function analyzeCoverage(options: AnalyzeCoverageOptions): Promise<CoverageAnalysisResult> {
  const { projectRoot, coverageData } = options;

  let coverage = coverageData;

  // If no coverage data provided, run coverage tool
  if (!coverage) {
    try {
      // Run c8 to generate coverage
      execSync('pnpm test --coverage --reporter=json', {
        cwd: projectRoot,
        stdio: 'pipe',
      });

      // Read coverage report
      const coveragePath = path.join(projectRoot, 'coverage', 'coverage-summary.json');
      const coverageContent = await fs.readFile(coveragePath, 'utf-8');
      coverage = JSON.parse(coverageContent);
    } catch (error) {
      throw new Error(`Failed to generate coverage: ${error}`);
    }
  }

  const total = coverage.total;

  return {
    totalCoverage: total.lines.pct,
    lineCoverage: total.lines.pct,
    functionCoverage: total.functions.pct,
    branchCoverage: total.branches.pct,
    statementCoverage: total.statements.pct,
  };
}

interface IdentifyGapsOptions {
  projectRoot: string;
  uncoveredLines: Record<string, number[]>;
}

export async function identifyGaps(options: IdentifyGapsOptions): Promise<GapAnalysisResult> {
  const { projectRoot, uncoveredLines } = options;
  const gaps: CoverageGap[] = [];

  for (const [file, lines] of Object.entries(uncoveredLines)) {
    // Group consecutive lines into ranges
    const ranges = groupConsecutiveLines(lines);

    for (const range of ranges) {
      // Read code snippet
      const filePath = path.join(projectRoot, file);
      let codeSnippet: string | undefined;

      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const allLines = content.split('\n');
        codeSnippet = allLines.slice(range.start - 1, range.end).join('\n');
      } catch (error) {
        // File might not exist in test environment
      }

      // Analyze reason for gap
      const reason = analyzeGapReason(codeSnippet || '');

      gaps.push({
        file,
        startLine: range.start,
        endLine: range.end,
        reason,
        codeSnippet,
      });
    }
  }

  return {
    gaps,
    totalGaps: gaps.length,
  };
}

function groupConsecutiveLines(lines: number[]): Array<{ start: number; end: number }> {
  if (lines.length === 0) return [];

  const sorted = [...lines].sort((a, b) => a - b);
  const ranges: Array<{ start: number; end: number }> = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      ranges.push({ start, end });
      start = sorted[i];
      end = sorted[i];
    }
  }

  ranges.push({ start, end });
  return ranges;
}

function analyzeGapReason(code: string): string {
  if (code.includes('catch') || code.includes('throw')) {
    return 'Error handling not covered';
  }
  if (code.includes('if') || code.includes('else')) {
    return 'Conditional branch not covered';
  }
  if (code.includes('null') || code.includes('undefined')) {
    return 'Null/undefined check not covered';
  }
  return 'Code path not covered';
}
