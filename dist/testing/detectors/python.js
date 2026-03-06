import fs from 'fs/promises';
import path from 'path';
export async function detectPythonStack(projectRoot) {
    const stack = {};
    try {
        // Check for requirements.txt
        const requirementsPath = path.join(projectRoot, 'requirements.txt');
        const requirements = await fs.readFile(requirementsPath, 'utf-8');
        stack.backend = {
            language: 'python',
            testFramework: requirements.includes('pytest') ? 'pytest' : requirements.includes('unittest') ? 'unittest' : undefined,
        };
        // Check for databases
        const databases = [];
        if (requirements.includes('psycopg2') || requirements.includes('psycopg3'))
            databases.push('postgresql');
        if (requirements.includes('pymysql') || requirements.includes('mysql-connector'))
            databases.push('mysql');
        if (requirements.includes('pymongo'))
            databases.push('mongodb');
        if (databases.length > 0)
            stack.databases = databases;
        // Check for API frameworks
        const apis = [];
        if (requirements.includes('flask') || requirements.includes('fastapi') || requirements.includes('django'))
            apis.push('rest');
        if (requirements.includes('graphene') || requirements.includes('strawberry'))
            apis.push('graphql');
        if (apis.length > 0)
            stack.apis = apis;
    }
    catch (error) {
        // requirements.txt not found
    }
    return stack;
}
//# sourceMappingURL=python.js.map