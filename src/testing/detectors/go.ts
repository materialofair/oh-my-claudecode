import fs from 'fs/promises';
import path from 'path';
import type { TechStack } from '../types.js';

export async function detectGoStack(projectRoot: string): Promise<Partial<TechStack>> {
  const stack: Partial<TechStack> = {};

  try {
    const goModPath = path.join(projectRoot, 'go.mod');
    const goMod = await fs.readFile(goModPath, 'utf-8');

    stack.backend = {
      language: 'go',
      testFramework: 'testing',
    };

    // Check for databases
    const databases: string[] = [];
    if (goMod.includes('github.com/lib/pq') || goMod.includes('github.com/jackc/pgx')) databases.push('postgresql');
    if (goMod.includes('github.com/go-sql-driver/mysql')) databases.push('mysql');
    if (goMod.includes('go.mongodb.org/mongo-driver')) databases.push('mongodb');
    if (databases.length > 0) stack.databases = databases;

    // Check for API frameworks
    const apis: ('rest' | 'graphql' | 'grpc')[] = [];
    if (goMod.includes('github.com/gin-gonic/gin') || goMod.includes('github.com/gorilla/mux')) apis.push('rest');
    if (goMod.includes('github.com/graphql-go/graphql')) apis.push('graphql');
    if (goMod.includes('google.golang.org/grpc')) apis.push('grpc');
    if (apis.length > 0) stack.apis = apis;
  } catch (error) {
    // go.mod not found
  }

  return stack;
}
