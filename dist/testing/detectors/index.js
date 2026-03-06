import fs from 'fs/promises';
import path from 'path';
import { detectFromPackageJson } from './package-json.js';
import { detectPythonStack } from './python.js';
import { detectGoStack } from './go.js';
import { detectRustStack } from './rust.js';
export async function detectTechStack(projectRoot) {
    let stack = {};
    // Try Node.js/JS detection
    try {
        const packageJsonPath = path.join(projectRoot, 'package.json');
        const content = await fs.readFile(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(content);
        stack = await detectFromPackageJson(packageJson);
    }
    catch (error) {
        // package.json not found
    }
    // Try Python detection
    try {
        const pythonStack = await detectPythonStack(projectRoot);
        stack = { ...stack, ...pythonStack };
    }
    catch (error) {
        // requirements.txt not found
    }
    // Try Go detection
    try {
        const goStack = await detectGoStack(projectRoot);
        stack = { ...stack, ...goStack };
    }
    catch (error) {
        // go.mod not found
    }
    // Try Rust detection
    try {
        const rustStack = await detectRustStack(projectRoot);
        stack = { ...stack, ...rustStack };
    }
    catch (error) {
        // Cargo.toml not found
    }
    return stack;
}
export { detectFromPackageJson, detectPythonStack, detectGoStack, detectRustStack };
//# sourceMappingURL=index.js.map