import { detectFromPackageJson } from './package-json.js';
import { detectPythonStack } from './python.js';
import { detectGoStack } from './go.js';
import { detectRustStack } from './rust.js';
import type { TechStack } from '../types.js';
export declare function detectTechStack(projectRoot: string): Promise<TechStack>;
export { detectFromPackageJson, detectPythonStack, detectGoStack, detectRustStack };
//# sourceMappingURL=index.d.ts.map