import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';

// Count JSX component references without exempting unused uppercase bindings.
const jsx = {
  rules: {
    'uses-vars': {
      meta: { schema: [] },
      create(context) {
        return {
          JSXOpeningElement(node) {
            let name = node.name;
            const member = name.type === 'JSXMemberExpression';
            while (name.type === 'JSXMemberExpression') name = name.object;
            if (name.type === 'JSXIdentifier' && (member || !/^[a-z]/.test(name.name))) {
              context.sourceCode.markVariableAsUsed(name.name, node);
            }
          },
        };
      },
    },
  },
};

export default [
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/storage/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'one-var': ['error', 'never'],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['jastiphub-frontend/src/**/*.{js,jsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { jsx, 'react-hooks': reactHooks },
    rules: {
      'jsx/uses-vars': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
    },
  },
];
