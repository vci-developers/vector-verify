// eslint.config.mjs
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

// Plugins (for flat config, we import & register them explicitly)
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // 1) Global ignores
  {
    ignores: ['**/node_modules/**', '.next/**', 'dist/**', 'coverage/**'],
  },

  // 2) Base from Next (legacy shareable configs via compat)
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // 3) Our TypeScript/React/import hygiene layer
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      'unused-imports': unusedImports,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      // So path aliases in tsconfig work with import rules
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
      },
      react: { version: 'detect' },
    },
    rules: {
      // Kill unused imports early
      'unused-imports/no-unused-imports': 'error',

      // Prefer `type` aliases for consistency
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],

      // React hooks safety
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Stable, readable import ordering (with our aliases)
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'object',
            'type',
          ],
          pathGroups: [
            { pattern: '@/**', group: 'internal', position: 'after' },
            { pattern: '@/app/**', group: 'internal', position: 'after' },
            { pattern: '@/shared/**', group: 'internal', position: 'after' },
            { pattern: '@/entities/**', group: 'internal', position: 'after' },
            { pattern: '@/features/**', group: 'internal', position: 'after' },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: { order: 'asc', caseInsensitive: true },
          'newlines-between': 'always',
        },
      ],

      // Reasonable console usage (tweak as you like)
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
];
