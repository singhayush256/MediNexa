import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['app/**/*.ts', 'app/**/*.tsx'],
    ignores: ['.next/**', 'node_modules/**'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
];
