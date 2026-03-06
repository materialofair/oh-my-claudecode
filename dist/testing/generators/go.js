export async function generateGoTest(options) {
    const { filePath, code, packageName } = options;
    // Generate test file path: .go → _test.go
    const testFilePath = filePath.replace(/\.go$/, '_test.go');
    // Extract exported functions (capitalized names)
    const functions = extractGoFunctions(code);
    // Generate test code
    const testCode = generateTestCode(packageName, functions);
    return { testFilePath, testCode };
}
function extractGoFunctions(code) {
    const functions = [];
    // Match exported functions (capitalized first letter)
    const funcRegex = /func\s+([A-Z]\w*)\s*\((.*?)\)\s*([\w.*[\]]*)?/g;
    let match;
    while ((match = funcRegex.exec(code)) !== null) {
        const name = match[1];
        const paramsStr = match[2];
        const returnType = (match[3] || '').trim();
        const params = parseGoParams(paramsStr);
        functions.push({ name, params, returnType });
    }
    return functions;
}
function parseGoParams(paramsStr) {
    if (!paramsStr.trim())
        return [];
    const params = [];
    const parts = paramsStr.split(',').map(p => p.trim());
    // Go allows grouped params: (a, b int) means both are int
    // Process right-to-left to resolve types
    let lastType = '';
    const parsed = [];
    for (const part of parts) {
        const tokens = part.split(/\s+/);
        if (tokens.length >= 2) {
            // Has explicit type: "a int" or "input string"
            const type = tokens[tokens.length - 1];
            const names = tokens.slice(0, -1);
            parsed.push({ names, type });
            lastType = type;
        }
        else {
            // No type, will inherit from next param with type
            parsed.push({ names: [tokens[0]], type: '' });
        }
    }
    // Resolve types right-to-left for grouped params
    for (let i = parsed.length - 1; i >= 0; i--) {
        if (parsed[i].type) {
            lastType = parsed[i].type;
        }
        else {
            parsed[i].type = lastType;
        }
    }
    for (const p of parsed) {
        for (const name of p.names) {
            params.push({ name, type: p.type });
        }
    }
    return params;
}
function generateTestCode(packageName, functions) {
    let code = `package ${packageName}\n\nimport "testing"\n\n`;
    for (const func of functions) {
        code += generateTableDrivenTest(func);
    }
    return code;
}
function generateTableDrivenTest(func) {
    const testName = `Test${func.name}`;
    // Build struct fields from params + expected result
    const structFields = func.params
        .map(p => `\t\t${p.name} ${p.type}`)
        .join('\n');
    const expectedField = func.returnType
        ? `\t\texpected ${func.returnType}`
        : '';
    const allFields = [structFields, expectedField].filter(Boolean).join('\n');
    // Build test case args
    const argsList = func.params.map(p => `tt.${p.name}`).join(', ');
    // Generate sample test case
    const sampleArgs = func.params.map(p => getZeroValue(p.type)).join(', ');
    const sampleExpected = func.returnType ? getZeroValue(func.returnType) : '';
    let testCase = func.params.map(p => `${getZeroValue(p.type)}`).join(', ');
    if (func.returnType) {
        testCase += `, ${sampleExpected}`;
    }
    let code = `func ${testName}(t *testing.T) {\n`;
    code += `\ttests := []struct {\n`;
    code += `\t\tname string\n`;
    code += `${allFields}\n`;
    code += `\t}{\n`;
    code += `\t\t{\n`;
    code += `\t\t\tname: "basic case",\n`;
    for (const p of func.params) {
        code += `\t\t\t${p.name}: ${getZeroValue(p.type)},\n`;
    }
    if (func.returnType) {
        code += `\t\t\texpected: ${getZeroValue(func.returnType)},\n`;
    }
    code += `\t\t},\n`;
    code += `\t}\n\n`;
    code += `\tfor _, tt := range tests {\n`;
    code += `\t\tt.Run(tt.name, func(t *testing.T) {\n`;
    if (func.returnType) {
        code += `\t\t\tgot := ${func.name}(${argsList})\n`;
        code += `\t\t\tif got != tt.expected {\n`;
        code += `\t\t\t\tt.Errorf("${func.name}() = %v, want %v", got, tt.expected)\n`;
        code += `\t\t\t}\n`;
    }
    else {
        code += `\t\t\t${func.name}(${argsList})\n`;
    }
    code += `\t\t})\n`;
    code += `\t}\n`;
    code += `}\n\n`;
    return code;
}
function getZeroValue(goType) {
    switch (goType) {
        case 'int':
        case 'int8':
        case 'int16':
        case 'int32':
        case 'int64':
        case 'uint':
        case 'uint8':
        case 'uint16':
        case 'uint32':
        case 'uint64':
        case 'float32':
        case 'float64':
            return '0';
        case 'string':
            return '""';
        case 'bool':
            return 'false';
        default:
            return 'nil';
    }
}
//# sourceMappingURL=go.js.map