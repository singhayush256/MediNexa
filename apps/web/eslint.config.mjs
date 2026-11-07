import tsParser from '@typescript-eslint/parser';
import nextPlugin from '@next/eslint-plugin-next';

export default [
  {
    files: ['app/**/*.ts', 'app/**/*.tsx'],
    ignores: ['.next/**', 'node_modules/**'],
    plugins: {
      '@next/next': nextPlugin,
    },
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
    rules: {
      '@next/next/no-img-element': 'warn',
    },
  },
];
