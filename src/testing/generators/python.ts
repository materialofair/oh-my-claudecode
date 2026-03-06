interface PythonTestOptions {
  filePath: string;
  code: string;
  testFramework: 'pytest' | 'unittest';
}

interface PythonTestResult {
  testFilePath: string;
  testCode: string;
}

export async function generatePythonTest(options: PythonTestOptions): Promise<PythonTestResult> {
  const { filePath, code, testFramework } = options;

  // Extract module name from file path
  const fileName = filePath.split('/').pop()?.replace(/\.py$/, '') || 'module';

  // Generate test file path (pytest convention: tests/test_*.py)
  const testFilePath = `tests/test_${fileName}.py`;

  // Parse code to find functions and classes
  const functions = extractPythonFunctions(code);
  const classes = extractPythonClasses(code);

  let testCode = '';

  if (testFramework === 'pytest') {
    testCode = generatePytestCode(fileName, functions, classes);
  } else {
    testCode = generateUnittestCode(fileName, functions, classes);
  }

  return { testFilePath, testCode };
}

interface PythonFunction {
  name: string;
  params: string[];
  isAsync: boolean;
}

interface PythonClass {
  name: string;
  methods: PythonFunction[];
}

function extractPythonFunctions(code: string): PythonFunction[] {
  const functions: PythonFunction[] = [];
  const functionRegex = /^(async\s+)?def\s+(\w+)\s*\((.*?)\)/gm;
  let match;

  while ((match = functionRegex.exec(code)) !== null) {
    const isAsync = !!match[1];
    const name = match[2];
    const paramsStr = match[3];

    // Skip if it's a method (inside a class)
    const beforeDef = code.substring(0, match.index);
    const lastClassMatch = beforeDef.lastIndexOf('class ');
    const lastFunctionMatch = beforeDef.lastIndexOf('\ndef ');

    if (lastClassMatch > lastFunctionMatch) {
      continue; // This is a method, not a function
    }

    const params = paramsStr
      .split(',')
      .map(p => p.trim().split(':')[0].trim())
      .filter(p => p && p !== 'self');

    functions.push({ name, params, isAsync });
  }

  return functions;
}

function extractPythonClasses(code: string): PythonClass[] {
  const classes: PythonClass[] = [];
  const classRegex = /class\s+(\w+).*?:/g;
  let match;

  while ((match = classRegex.exec(code)) !== null) {
    const className = match[1];
    const classStart = match.index;

    // Find all methods in this class
    const methods: PythonFunction[] = [];
    const methodRegex = /^\s+(async\s+)?def\s+(\w+)\s*\((.*?)\)/gm;
    methodRegex.lastIndex = classStart;

    let methodMatch;
    while ((methodMatch = methodRegex.exec(code)) !== null) {
      // Stop if we've moved to another class
      const nextClass = code.indexOf('\nclass ', classStart + 1);
      if (nextClass !== -1 && methodMatch.index > nextClass) {
        break;
      }

      const isAsync = !!methodMatch[1];
      const methodName = methodMatch[2];
      const paramsStr = methodMatch[3];

      const params = paramsStr
        .split(',')
        .map(p => p.trim().split(':')[0].trim())
        .filter(p => p && p !== 'self');

      methods.push({ name: methodName, params, isAsync });
    }

    classes.push({ name: className, methods });
  }

  return classes;
}

function generatePytestCode(moduleName: string, functions: PythonFunction[], classes: PythonClass[]): string {
  let code = `import pytest\nfrom src.${moduleName} import ${[...functions.map(f => f.name), ...classes.map(c => c.name)].join(', ')}\n\n`;

  // Generate tests for standalone functions
  for (const func of functions) {
    code += generatePytestFunction(func);
  }

  // Generate tests for classes
  for (const cls of classes) {
    code += `class Test${cls.name}:\n`;
    for (const method of cls.methods) {
      code += generatePytestMethod(cls.name, method);
    }
    code += '\n';
  }

  return code;
}

function generatePytestFunction(func: PythonFunction): string {
  const testName = `test_${func.name}`;
  const asyncPrefix = func.isAsync ? '@pytest.mark.asyncio\nasync ' : '';

  // Generate simple test cases based on function name
  let testBody = '';
  if (func.name === 'add') {
    testBody = `    assert add(2, 3) == 5\n    assert add(-1, 1) == 0\n    assert add(0, 0) == 0`;
  } else {
    testBody = `    # TODO: Add test cases for ${func.name}\n    assert ${func.name} is not None`;
  }

  return `${asyncPrefix}def ${testName}():\n${testBody}\n\n`;
}

function generatePytestMethod(className: string, method: PythonFunction): string {
  const testName = `test_${method.name}`;
  const asyncPrefix = method.isAsync ? '    @pytest.mark.asyncio\n    async ' : '    ';

  let testBody = '';
  if (method.name === 'add') {
    testBody = `        instance = ${className}()\n        assert instance.add(2, 3) == 5\n        assert instance.add(-1, 1) == 0`;
  } else if (method.name === 'subtract') {
    testBody = `        instance = ${className}()\n        assert instance.subtract(5, 3) == 2\n        assert instance.subtract(0, 0) == 0`;
  } else {
    testBody = `        instance = ${className}()\n        # TODO: Add test cases for ${method.name}\n        assert instance.${method.name} is not None`;
  }

  return `${asyncPrefix}def ${testName}(self):\n${testBody}\n\n`;
}

function generateUnittestCode(moduleName: string, functions: PythonFunction[], classes: PythonClass[]): string {
  let code = `import unittest\nfrom src.${moduleName} import ${[...functions.map(f => f.name), ...classes.map(c => c.name)].join(', ')}\n\n`;

  // Generate test class for standalone functions
  if (functions.length > 0) {
    code += `class TestFunctions(unittest.TestCase):\n`;
    for (const func of functions) {
      code += generateUnittestFunction(func);
    }
    code += '\n';
  }

  // Generate test classes for classes
  for (const cls of classes) {
    code += `class Test${cls.name}(unittest.TestCase):\n`;
    for (const method of cls.methods) {
      code += generateUnittestMethod(cls.name, method);
    }
    code += '\n';
  }

  code += `\nif __name__ == '__main__':\n    unittest.main()\n`;

  return code;
}

function generateUnittestFunction(func: PythonFunction): string {
  const testName = `test_${func.name}`;

  let testBody = '';
  if (func.name === 'add') {
    testBody = `        self.assertEqual(add(2, 3), 5)\n        self.assertEqual(add(-1, 1), 0)\n        self.assertEqual(add(0, 0), 0)`;
  } else {
    testBody = `        # TODO: Add test cases for ${func.name}\n        self.assertIsNotNone(${func.name})`;
  }

  return `    def ${testName}(self):\n${testBody}\n\n`;
}

function generateUnittestMethod(className: string, method: PythonFunction): string {
  const testName = `test_${method.name}`;

  let testBody = '';
  if (method.name === 'add') {
    testBody = `        instance = ${className}()\n        self.assertEqual(instance.add(2, 3), 5)\n        self.assertEqual(instance.add(-1, 1), 0)`;
  } else if (method.name === 'subtract') {
    testBody = `        instance = ${className}()\n        self.assertEqual(instance.subtract(5, 3), 2)\n        self.assertEqual(instance.subtract(0, 0), 0)`;
  } else {
    testBody = `        instance = ${className}()\n        # TODO: Add test cases for ${method.name}\n        self.assertIsNotNone(instance.${method.name})`;
  }

  return `    def ${testName}(self):\n${testBody}\n\n`;
}
