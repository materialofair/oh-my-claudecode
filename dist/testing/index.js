export * from './types.js';
import { detectTechStack } from './detectors/index.js';
export const TestingModule = {
    detectStack: async () => {
        return detectTechStack(process.cwd());
    },
    generateTests: async () => {
        throw new Error('Not implemented');
    },
};
//# sourceMappingURL=index.js.map