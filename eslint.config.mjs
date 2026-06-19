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

// Пустой alt="" запрещён (a11y) — см. блок no-restricted-syntax ниже.
const ALT_RESTRICTION = {
  selector: 'JSXAttribute[name.name="alt"]:matches([value.value=""], [value.expression.value=""])',
  message:
    'Empty alt="" is not allowed. Provide a meaningful alt, or add an eslint-disable comment if the image is purely decorative.',
};

// Идентичность сущностей в редьюсерах/мапперах должна быть детерминированной:
// random-id пересоздаются на каждый рефетч и ломают React-ключи (ремаунт списков).
const RANDOM_ID_RESTRICTIONS = [
  {
    selector: "CallExpression[callee.object.name='crypto'][callee.property.name='randomUUID']",
    message:
      'crypto.randomUUID() в store/мапперах запрещён — id должны быть детерминированными (с бека или по позиции).',
  },
  {
    selector: "MemberExpression[object.name='Math'][property.name='random']",
    message:
      'Math.random() в store/мапперах запрещён — id должны быть детерминированными (с бека или по позиции).',
  },
];

// Порядок импортов под FSD-слои. Группы для @/entities, @/features, @/widgets
// заведены наперёд — они безвредны, пока соответствующих папок ещё нет.
const IMPORT_ORDER_GROUPS = {
  groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index'], 'object'],
  pathGroups: [
    { pattern: 'react', group: 'external', position: 'before' },
    { pattern: 'next/**', group: 'external', position: 'before' },
    { pattern: '@/entities/**', group: 'internal', position: 'before' },
    { pattern: '@/features/**', group: 'internal' },
    { pattern: '@/widgets/**', group: 'internal' },
    { pattern: '@/shared/**', group: 'internal', position: 'after' },
    { pattern: '@/**', group: 'internal', position: 'after' },
    { pattern: 'api/**', group: 'internal', position: 'after' },
    { pattern: 'store/**', group: 'internal', position: 'after' },
    { pattern: 'app/**', group: 'internal', position: 'after' },
  ],
  pathGroupsExcludedImportTypes: ['react', 'next'],
  'newlines-between': 'always',
  alphabetize: { order: 'asc', caseInsensitive: true },
};

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
    settings: {
      'import/resolver': {
        typescript: { alwaysTryTypes: true, project: './tsconfig.json' },
        node: true,
      },
    },
    rules: {
      'import/no-cycle': 'error',
      'import/order': ['error', IMPORT_ORDER_GROUPS],
      'import/no-duplicates': 'error',
    },
  },
  {
    plugins: { promise: promiselint },
    rules: promiselint.configs.recommended.rules,
  },
  {
    plugins: { 'react-hooks': hookslint },
    rules: {
      ...hookslint.configs.recommended.rules,
      'react-hooks/exhaustive-deps': 'error',
    },
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
    plugins: { 'react-refresh': reactRefresh },
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    plugins: { '@next/next': nextPlugin },
    rules: nextPlugin.configs.recommended.rules,
  },
  eslintConfigPrettier,
  {
    ignores: [
      '.next/',
      '.idea/',
      '.git/',
      '.claude/',
      'docs/',
      'dist/',
      'test-results/',
      'playwright-report/',
      'node_modules/',
      'next-env.d.ts',
    ],
  },
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-expressions': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'interface', format: ['PascalCase'], prefix: ['I'] },
        { selector: 'typeAlias', format: ['PascalCase'], prefix: ['T'] },
      ],
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
      'react/self-closing-comp': 'error',
      'react/jsx-boolean-value': ['error', 'never'],
      'react/jsx-no-useless-fragment': 'error',
      'no-useless-concat': 'error',
      'prefer-template': 'error',
      'no-restricted-syntax': ['error', ALT_RESTRICTION],
    },
  },
  // store + мапперы: дополнительно запрещаем random-идентичность. Flat config
  // ЗАМЕНЯЕТ правило для матчащихся файлов, поэтому базовые селекторы включены повторно.
  {
    files: ['store/**/*.{ts,tsx}', 'src/shared/utils/map*.ts'],
    rules: {
      'no-restricted-syntax': ['error', ALT_RESTRICTION, ...RANDOM_ID_RESTRICTIONS],
    },
  },
  {
    files: ['eslint.config.mjs', '*.config.{js,mjs,cjs,ts}', 'scripts/**'],
    rules: { 'n/no-unpublished-import': 'off' },
  },
];
