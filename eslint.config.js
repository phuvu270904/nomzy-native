const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const prettier = require('eslint-plugin-prettier');

module.exports = defineConfig([
  {
    ...expoConfig[0],
    files: ['**/*.{js,ts,jsx,tsx}'],
    ignores: ['dist/**', 'node_modules/**', 'eslint.config.js'],
    languageOptions: {
      ...expoConfig[0].languageOptions,
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
    },
    plugins: {
      ...expoConfig[0].plugins,
      '@typescript-eslint': tsPlugin,
      import: require('eslint-plugin-import'),
      prettier: prettier,
    },
    rules: {
      ...expoConfig[0].rules,
      'prettier/prettier': 'warn',
      'import/no-unresolved': 'off',
      '@typescript-eslint/no-unused-vars': ['warn'],
    },
    settings: {
      'import/resolver': {
        typescript: {},
      },
    },
  },
]);
