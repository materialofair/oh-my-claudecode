import fs from 'fs/promises';
import path from 'path';
import { detectFromPackageJson } from './package-json';
import type { TechStack } from '../types';

export async function detectTechStack(projectRoot: string): Promise<TechStack> {
  const packageJsonPath = path.join(projectRoot, 'package.json');

  try {
    const content = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(content);
    return await detectFromPackageJson(packageJson);
  } catch (error) {
    return {};
  }
}

export { detectFromPackageJson };
