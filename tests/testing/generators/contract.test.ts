import { describe, it, expect } from 'vitest';
import { generateContractTest } from '../../../src/testing/generators/contract';

describe('Contract Test Generator', () => {
  it('should generate Pact test from OpenAPI spec', async () => {
    const openApiSpec = {
      openapi: '3.0.0',
      paths: {
        '/users/{id}': {
          get: {
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: {
              '200': {
                description: 'User found',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const result = await generateContractTest({
      spec: openApiSpec,
      framework: 'pact',
      consumer: 'frontend',
      provider: 'backend',
    });

    expect(result.testCode).toContain('pact');
    expect(result.testCode).toContain('/users/{id}');
    expect(result.testCode).toContain('willRespondWith');
  });

  it('should generate REST API contract test', async () => {
    const apiDefinition = {
      endpoint: '/api/orders',
      method: 'POST',
      requestBody: {
        customerId: 'string',
        items: 'array',
        total: 'number',
      },
      responseBody: {
        orderId: 'string',
        status: 'string',
      },
    };

    const result = await generateContractTest({
      apiDefinition,
      framework: 'supertest',
    });

    expect(result.testCode).toContain('POST /api/orders');
    expect(result.testCode).toContain('expect(200)');
  });
});
