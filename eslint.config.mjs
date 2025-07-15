import pluginJs from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import nodePlugin from 'eslint-plugin-n';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import promiselint from 'eslint-plugin-promise';
import pluginReact from 'eslint-plugin-react';
import hookslint from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  { settings: { react: { version: 'detect' } } },
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  eslintPluginPrettierRecommended,
  {
    plugins: { import: importPlugin },
    rules: {
      'import/no-cycle': 'error',
    },
  },
  {
    plugins: { promise: promiselint },
    rules: promiselint.configs.recommended.rules,
  },
  {
    plugins: { 'react-hooks': hookslint },
    rules: hookslint.configs.recommended.rules,
  },
  {
    plugins: { n: nodePlugin },
    rules: {
      ...nodePlugin.configs.recommended.rules,
      'n/no-unsupported-features/node-builtins': 'off',
      'n/no-missing-import': 'off',
      'n/exports-style': ['error', 'module.exports'],
    },
  },
  {
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    plugins: { '@next/next': nextPlugin },
    rules: nextPlugin.configs.recommended.rules,
  },
  eslintConfigPrettier,
  pluginReact.configs.flat.recommended,
  {
    ignores: [
      'docs/',
      'dist/',
      'test-results/',
      'playwright-report/',
      'node_modules/',
    ],
  },
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-expressions': 'off', // TODO: error if on
      '@typescript-eslint/naming-convention': [
        'error',
        {
          // Правило для интерфейсов (префикс I)
          selector: 'interface',
          format: ['PascalCase'],
          prefix: ['I'],
        },
        {
          // Правило для типов (префикс T)
          selector: 'typeAlias',
          format: ['PascalCase'],
          prefix: ['T'],
        },
      ],
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],
    },
  },
];
