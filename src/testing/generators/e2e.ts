/**
 * E2E Test Generator for Playwright
 * Generates Playwright test files from user flow descriptions
 */

export interface E2EStep {
  action: 'goto' | 'click' | 'fill' | 'expect' | 'waitFor' | 'screenshot';
  target: string;
  value?: string;
  assertion?: string;
}

export interface GeneratePlaywrightTestOptions {
  steps: E2EStep[];
  testName: string;
  testSuite?: string;
}

export interface GenerateFromUserFlowOptions {
  flowDescription: string;
  baseUrl: string;
  testName: string;
}

export interface UserFlowResult {
  testCode: string;
  steps: E2EStep[];
}

const PLAYWRIGHT_TEST_TEMPLATE = `import { test, expect } from '@playwright/test';

test.describe('{{testSuite}}', () => {
  test('{{testName}}', async ({ page }) => {
    {{testSteps}}
  });
});
`;

const STEP_TEMPLATES: Record<E2EStep['action'], string> = {
  goto: "await page.goto('{{target}}');",
  click: "await page.click('{{target}}');",
  fill: "await page.fill('{{target}}', '{{value}}');",
  expect: "await expect(page.locator('{{target}}')).{{assertion}}();",
  waitFor: "await page.waitForSelector('{{target}}');",
  screenshot: "await page.screenshot({ path: '{{target}}' });",
};

function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || '');
}

/**
 * Generate Playwright test code from structured steps
 */
export async function generatePlaywrightTest(
  options: GeneratePlaywrightTestOptions
): Promise<string> {
  const { steps, testName, testSuite = 'E2E Tests' } = options;

  const testSteps = steps
    .map((step) => {
      const template = STEP_TEMPLATES[step.action];
      return renderTemplate(template, {
        target: step.target,
        value: step.value || '',
        assertion: step.assertion || '',
      });
    })
    .join('\n    ');

  return renderTemplate(PLAYWRIGHT_TEST_TEMPLATE, {
    testSuite,
    testName,
    testSteps,
  });
}

/**
 * Parse user flow description and generate Playwright test
 * This is a simplified implementation - in production, use LLM for better parsing
 */
export async function generateFromUserFlow(
  options: GenerateFromUserFlowOptions
): Promise<UserFlowResult> {
  const { flowDescription, baseUrl, testName } = options;

  // Parse flow description into high-level steps
  const steps: E2EStep[] = [];
  const lowerFlow = flowDescription.toLowerCase();

  // Split by common delimiters to identify distinct actions
  const actions = flowDescription.split(/,\s*/).map(s => s.trim().toLowerCase());

  for (const action of actions) {
    if (action.includes('logs in') || action.includes('login')) {
      // Simplified: represent login as a single goto action
      steps.push({ action: 'goto', target: `${baseUrl}/login` });
    } else if (action.includes('navigates to') || action.includes('dashboard')) {
      steps.push({ action: 'goto', target: `${baseUrl}/dashboard` });
    } else if (action.includes('clicks on') || action.includes('settings')) {
      steps.push({ action: 'click', target: 'a[href="/settings"]' });
    }
  }

  const testCode = await generatePlaywrightTest({ steps, testName });

  return {
    testCode,
    steps,
  };
}
