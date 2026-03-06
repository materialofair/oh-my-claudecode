import { describe, it, expect } from 'vitest';
import { generatePlaywrightTest, generateFromUserFlow } from '../../../src/testing/generators/e2e';

describe('E2E Test Generator', () => {
  it('should generate Playwright test from user flow description', async () => {
    const result = await generateFromUserFlow({
      flowDescription: 'User logs in, navigates to dashboard, clicks on settings',
      baseUrl: 'http://localhost:3000',
      testName: 'User Settings Flow',
    });

    expect(result.testCode).toContain("test('User Settings Flow'");
    expect(result.testCode).toContain('await page.goto');
    expect(result.testCode).toContain('await page.click');
    expect(result.steps).toHaveLength(3);
  });

  it('should generate test with assertions', async () => {
    const result = await generatePlaywrightTest({
      steps: [
        { action: 'goto', target: '/login' },
        { action: 'fill', target: '#username', value: 'testuser' },
        { action: 'fill', target: '#password', value: 'password123' },
        { action: 'click', target: 'button[type="submit"]' },
        { action: 'expect', target: '.dashboard', assertion: 'toBeVisible' },
      ],
      testName: 'Login Flow',
    });

    expect(result).toContain("await page.fill('#username'");
    expect(result).toContain("await expect(page.locator('.dashboard')).toBeVisible()");
  });
});
