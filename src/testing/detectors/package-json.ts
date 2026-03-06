import type { TechStack } from '../types';

export async function detectFromPackageJson(packageJson: any): Promise<TechStack> {
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const stack: TechStack = {};

  // Detect frontend framework
  if (deps.react) {
    stack.frontend = {
      framework: 'react',
      testFramework: deps.vitest ? 'vitest' : deps.jest ? 'jest' : 'none',
    };
  } else if (deps.vue) {
    stack.frontend = {
      framework: 'vue',
      testFramework: deps.vitest ? 'vitest' : 'none',
    };
  } else if (deps.svelte) {
    stack.frontend = {
      framework: 'svelte',
      testFramework: deps.vitest ? 'vitest' : 'none',
    };
  }

  // Detect backend
  if (deps.express || deps.fastify || deps.koa) {
    stack.backend = {
      language: 'nodejs',
      testFramework: deps.vitest ? 'vitest' : deps.jest ? 'jest' : undefined,
    };
  }

  // Detect databases
  const databases: string[] = [];
  if (deps.pg || deps.postgres) databases.push('postgresql');
  if (deps.mysql || deps.mysql2) databases.push('mysql');
  if (deps.mongodb || deps.mongoose) databases.push('mongodb');
  if (databases.length > 0) stack.databases = databases;

  // Detect API types
  const apis: ('rest' | 'graphql' | 'grpc')[] = [];
  if (deps.express || deps.fastify) apis.push('rest');
  if (deps.graphql || deps['@apollo/server']) apis.push('graphql');
  if (deps['@grpc/grpc-js']) apis.push('grpc');
  if (apis.length > 0) stack.apis = apis;

  return stack;
}
