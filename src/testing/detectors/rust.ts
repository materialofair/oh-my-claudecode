import fs from 'fs/promises';
import path from 'path';
import type { TechStack } from '../types.js';

export async function detectRustStack(projectRoot: string): Promise<Partial<TechStack>> {
  const stack: Partial<TechStack> = {};

  try {
    // Check for Cargo.toml
    const cargoTomlPath = path.join(projectRoot, 'Cargo.toml');
    const cargoToml = await fs.readFile(cargoTomlPath, 'utf-8');

    stack.backend = {
      language: 'rust',
      testFramework: 'cargo test', // Rust's built-in testing
    };

    // Check for databases
    const databases: string[] = [];
    if (cargoToml.includes('tokio-postgres') || cargoToml.includes('sqlx')) databases.push('postgresql');
    if (cargoToml.includes('mysql_async')) databases.push('mysql');
    if (cargoToml.includes('mongodb')) databases.push('mongodb');
    if (databases.length > 0) stack.databases = databases;

    // Check for API frameworks
    const apis: ('rest' | 'graphql' | 'grpc')[] = [];
    if (cargoToml.includes('actix-web') || cargoToml.includes('rocket') || cargoToml.includes('axum')) apis.push('rest');
    if (cargoToml.includes('async-graphql') || cargoToml.includes('juniper')) apis.push('graphql');
    if (cargoToml.includes('tonic')) apis.push('grpc');
    if (apis.length > 0) stack.apis = apis;
  } catch (error) {
    // Cargo.toml not found
  }

  return stack;
}
