interface ContractTestOptions {
  spec?: any; // OpenAPI spec
  apiDefinition?: any; // Simple API definition
  framework: 'pact' | 'supertest' | 'msw';
  consumer?: string;
  provider?: string;
}

interface ContractTestResult {
  testCode: string;
  testFilePath: string;
}

export async function generateContractTest(options: ContractTestOptions): Promise<ContractTestResult> {
  const { spec, apiDefinition, framework, consumer, provider } = options;

  let testCode = '';
  let testFilePath = '';

  if (framework === 'pact' && spec) {
    testCode = generatePactTest(spec, consumer || 'consumer', provider || 'provider');
    testFilePath = `tests/contract/${consumer}-${provider}.pact.test.ts`;
  } else if (framework === 'supertest' && apiDefinition) {
    testCode = generateSupertestContract(apiDefinition);
    testFilePath = `tests/contract/api.contract.test.ts`;
  } else if (framework === 'msw' && spec) {
    testCode = generateMSWHandlers(spec);
    testFilePath = `tests/mocks/handlers.ts`;
  }

  return { testCode, testFilePath };
}

function generatePactTest(spec: any, consumer: string, provider: string): string {
  const paths = spec.paths || {};
  const interactions: string[] = [];

  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, details] of Object.entries(methods as any)) {
      const interaction = generatePactInteraction(path, method.toUpperCase(), details);
      interactions.push(interaction);
    }
  }

  return `import { Pact } from '@pact-foundation/pact';
import { like, eachLike } from '@pact-foundation/pact/dsl/matchers';

describe('${consumer} <-> ${provider} Contract', () => {
  const provider = new Pact({
    consumer: '${consumer}',
    provider: '${provider}',
    port: 1234,
    log: './logs/pact.log',
    dir: './pacts',
  });

  beforeAll(() => provider.setup());
  afterEach(() => provider.verify());
  afterAll(() => provider.finalize());

${interactions.join('\n\n')}
});
`;
}

function generatePactInteraction(path: string, method: string, details: any): string {
  const response = details.responses?.['200'] || details.responses?.['201'];
  const responseSchema = response?.content?.['application/json']?.schema;

  const responseBody = responseSchema ? generateMatcherFromSchema(responseSchema) : '{}';

  return `  it('${method} ${path}', async () => {
    await provider.addInteraction({
      state: 'resource exists',
      uponReceiving: '${method} request to ${path}',
      withRequest: {
        method: '${method}',
        path: '${path}',
      },
      willRespondWith: {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: ${responseBody},
      },
    });

    // Make actual request and verify
    const response = await fetch(\`http://localhost:1234${path}\`);
    expect(response.status).toBe(200);
  });`;
}

function generateMatcherFromSchema(schema: any): string {
  if (schema.type === 'object') {
    const properties = schema.properties || {};
    const matchers: string[] = [];

    for (const [key, prop] of Object.entries(properties as Record<string, any>)) {
      if (prop.type === 'string') {
        matchers.push(`${key}: like('example')`);
      } else if (prop.type === 'number') {
        matchers.push(`${key}: like(123)`);
      } else if (prop.type === 'boolean') {
        matchers.push(`${key}: like(true)`);
      } else if (prop.type === 'array') {
        matchers.push(`${key}: eachLike({ id: like('1') })`);
      }
    }

    return `{ ${matchers.join(', ')} }`;
  }

  return '{}';
}

function generateSupertestContract(apiDefinition: any): string {
  const { endpoint, method, requestBody, responseBody } = apiDefinition;

  const requestExample = generateExampleFromSchema(requestBody);
  const responseExample = generateExampleFromSchema(responseBody);

  return `import request from 'supertest';
import app from '../src/app';

describe('API Contract Tests', () => {
  it('${method} ${endpoint} should match contract', async () => {
    const response = await request(app)
      .${method.toLowerCase()}('${endpoint}')
      .send(${JSON.stringify(requestExample, null, 2)})
      .expect(200)
      .expect('Content-Type', /json/);

    // Verify response structure
    expect(response.body).toMatchObject(${JSON.stringify(responseExample, null, 2)});
  });
});
`;
}

function generateMSWHandlers(spec: any): string {
  const paths = spec.paths || {};
  const handlers: string[] = [];

  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, details] of Object.entries(methods as any)) {
      const handler = generateMSWHandler(path, method, details);
      handlers.push(handler);
    }
  }

  return `import { rest } from 'msw';

export const handlers = [
${handlers.join(',\n\n')}
];
`;
}

function generateMSWHandler(path: string, method: string, details: any): string {
  const response = details.responses?.['200'] || details.responses?.['201'];
  const responseSchema = response?.content?.['application/json']?.schema;
  const responseExample = responseSchema ? generateExampleFromSchema(responseSchema.properties || {}) : {};

  return `  rest.${method.toLowerCase()}('${path}', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(${JSON.stringify(responseExample, null, 2)})
    );
  })`;
}

function generateExampleFromSchema(schema: any): any {
  if (typeof schema === 'string') {
    return schema === 'string' ? 'example' : schema === 'number' ? 123 : schema === 'boolean' ? true : [];
  }

  const example: any = {};

  for (const [key, type] of Object.entries(schema)) {
    if (type === 'string') {
      example[key] = 'example';
    } else if (type === 'number') {
      example[key] = 123;
    } else if (type === 'boolean') {
      example[key] = true;
    } else if (type === 'array') {
      example[key] = [];
    }
  }

  return example;
}
