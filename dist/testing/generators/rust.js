export async function generateRustTest(options) {
    const { filePath, code } = options;
    // Rust tests are typically in the same file
    const testFilePath = filePath;
    // Extract functions and methods
    const functions = extractRustFunctions(code);
    const structs = extractRustStructs(code);
    // Generate test module
    const testCode = generateRustTestModule(functions, structs);
    return { testCode, testFilePath };
}
function extractRustFunctions(code) {
    const functions = [];
    const functionRegex = /(pub\s+)?fn\s+(\w+)\s*\((.*?)\)\s*(?:->\s*(.*?))?\s*{/g;
    let match;
    while ((match = functionRegex.exec(code)) !== null) {
        const isPublic = !!match[1];
        const name = match[2];
        const paramsStr = match[3];
        const returnType = match[4]?.trim() || '()';
        // Skip if inside impl block (will be handled as methods)
        const beforeFn = code.substring(0, match.index);
        const lastImpl = beforeFn.lastIndexOf('impl ');
        const lastCloseBrace = beforeFn.lastIndexOf('}');
        if (lastImpl > lastCloseBrace) {
            continue; // This is a method
        }
        const params = parseRustParams(paramsStr);
        functions.push({ name, params, returnType, isPublic });
    }
    return functions;
}
function extractRustStructs(code) {
    const structs = [];
    const structRegex = /struct\s+(\w+)/g;
    let match;
    while ((match = structRegex.exec(code)) !== null) {
        const structName = match[1];
        // Find impl block for this struct
        const implRegex = new RegExp(`impl\\s+${structName}\\s*{([^}]+)}`, 's');
        const implMatch = implRegex.exec(code);
        if (implMatch) {
            const implBody = implMatch[1];
            const methods = extractRustMethods(implBody);
            structs.push({ name: structName, methods });
        }
    }
    return structs;
}
function extractRustMethods(implBody) {
    const methods = [];
    const methodRegex = /(pub\s+)?fn\s+(\w+)\s*\((.*?)\)\s*(?:->\s*(.*?))?\s*{/g;
    let match;
    while ((match = methodRegex.exec(implBody)) !== null) {
        const isPublic = !!match[1];
        const name = match[2];
        const paramsStr = match[3];
        const returnType = match[4]?.trim() || '()';
        const params = parseRustParams(paramsStr);
        methods.push({ name, params, returnType, isPublic });
    }
    return methods;
}
function parseRustParams(paramsStr) {
    if (!paramsStr.trim())
        return [];
    const params = [];
    const parts = paramsStr.split(',').map(p => p.trim());
    for (const part of parts) {
        const colonIndex = part.indexOf(':');
        if (colonIndex !== -1) {
            const name = part.substring(0, colonIndex).trim();
            const type = part.substring(colonIndex + 1).trim();
            params.push({ name, type });
        }
    }
    return params;
}
function generateRustTestModule(functions, structs) {
    let code = `\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n`;
    // Generate tests for standalone functions
    for (const func of functions) {
        if (func.isPublic) {
            code += generateRustTestFunction(func);
        }
    }
    // Generate tests for struct methods
    for (const struct of structs) {
        for (const method of struct.methods) {
            if (method.isPublic) {
                code += generateRustTestMethod(struct.name, method);
            }
        }
    }
    code += `}\n`;
    return code;
}
function generateRustTestFunction(func) {
    const testName = `test_${func.name}`;
    let testBody = '';
    if (func.name === 'add') {
        testBody = `        assert_eq!(add(2, 3), 5);
        assert_eq!(add(-1, 1), 0);
        assert_eq!(add(0, 0), 0);`;
    }
    else {
        testBody = `        // TODO: Add test implementation for ${func.name}`;
    }
    return `    #[test]
    fn ${testName}() {
${testBody}
    }

`;
}
function generateRustTestMethod(structName, method) {
    const testName = `test_${method.name}`;
    let testBody = '';
    if (method.name === 'new') {
        testBody = `        let instance = ${structName}::new();
        // TODO: Add assertions`;
    }
    else if (method.name === 'add') {
        testBody = `        let mut instance = ${structName}::new();
        instance.add(5);
        // TODO: Add assertions`;
    }
    else {
        testBody = `        // TODO: Add test implementation for ${method.name}`;
    }
    return `    #[test]
    fn ${testName}() {
${testBody}
    }

`;
}
//# sourceMappingURL=rust.js.map