import { describe, it, expect } from 'vitest';
import { analyzeComplexity } from '../../../src/testing/analyzers/complexity';

describe('Complexity Analyzer', () => {
  it('should classify simple function', async () => {
    const simpleCode = `
export function add(a: number, b: number): number {
  return a + b;
}
`;

    const result = await analyzeComplexity({
      code: simpleCode,
      filePath: 'src/utils/math.ts',
    });

    expect(result.complexity).toBe('simple');
    expect(result.metrics.lines).toBeLessThan(50);
    expect(result.metrics.cyclomaticComplexity).toBeLessThan(10);
  });

  it('should classify complex function', async () => {
    const complexCode = `
export async function processPayment(order: Order, payment: PaymentInfo): Promise<PaymentResult> {
  if (!order || !payment) {
    throw new Error('Invalid input');
  }

  try {
    const customer = await getCustomer(order.customerId);
    if (!customer.isActive) {
      return { success: false, error: 'Inactive customer' };
    }

    const stripeResult = await stripe.charges.create({
      amount: order.total,
      currency: 'usd',
      source: payment.token,
    });

    if (stripeResult.status === 'succeeded') {
      await db.transaction(async (trx) => {
        await trx('orders').where({ id: order.id }).update({ status: 'paid' });
        await trx('payments').insert({ orderId: order.id, stripeId: stripeResult.id });
      });

      return { success: true, transactionId: stripeResult.id };
    } else {
      return { success: false, error: 'Payment failed' };
    }
  } catch (error) {
    logger.error('Payment processing error', error);
    return { success: false, error: error.message };
  }
}
`;

    const result = await analyzeComplexity({
      code: complexCode,
      filePath: 'src/services/payment.ts',
    });

    expect(result.complexity).toBe('complex');
    expect(result.reasons).toContain('External API calls');
    expect(result.reasons).toContain('Database transactions');
  });
});
