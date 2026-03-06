import { describe, it, expect } from 'vitest';
import { prepareTestEngineerContext } from '../../../src/testing/cli/agent-integration';

describe('Test-Engineer Agent Integration', () => {
  it('should prepare context for simple code', async () => {
    const context = await prepareTestEngineerContext({
      filePath: 'src/utils/math.ts',
      code: 'export function add(a: number, b: number) { return a + b; }',
      projectRoot: process.cwd(),
    });

    expect(context.complexity).toBe('simple');
    expect(context.techStack).toBeDefined();
    expect(context.suggestedApproach).toBe('auto-generate');
  });

  it('should prepare context for complex code', async () => {
    const complexCode = `
export async function processPayment(order: Order) {
  const stripe = await getStripeClient();
  const result = await stripe.charges.create({ amount: order.total });
  await db.transaction(async (trx) => {
    await trx('orders').update({ status: 'paid' });
  });
  return result;
}
`;

    const context = await prepareTestEngineerContext({
      filePath: 'src/services/payment.ts',
      code: complexCode,
      projectRoot: process.cwd(),
    });

    expect(context.complexity).toBe('complex');
    expect(context.suggestedApproach).toBe('guided');
    expect(context.questionsForUser).toBeDefined();
  });
});
