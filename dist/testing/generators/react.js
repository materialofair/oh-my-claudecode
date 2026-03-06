export async function generateReactTest(options) {
    const { filePath, code, testFramework } = options;
    // Extract component name from file path
    const fileName = filePath.split('/').pop()?.replace(/\.(tsx?|jsx?)$/, '') || 'Component';
    // Generate test file path
    const testFilePath = filePath.replace(/\.(tsx?|jsx?)$/, '.test.$1');
    // Parse component to understand props and behavior
    const hasOnClick = code.includes('onClick');
    const hasChildren = code.includes('children');
    // Generate test code
    const testCode = `import { describe, it, expect${testFramework === 'vitest' ? ', vi' : ''} } from '${testFramework}';
import { render, screen${hasOnClick ? ', fireEvent' : ''} } from '@testing-library/react';
import { ${fileName} } from './${fileName}';

describe('${fileName}', () => {
  it('renders children', () => {
    render(<${fileName}>Click me</${fileName}>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
${hasOnClick ? `
  it('calls onClick when clicked', () => {
    const handleClick = ${testFramework === 'vitest' ? 'vi.fn()' : 'jest.fn()'};
    render(<${fileName} onClick={handleClick}>Click me</${fileName}>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
` : ''}});
`;
    return { testFilePath, testCode };
}
//# sourceMappingURL=react.js.map