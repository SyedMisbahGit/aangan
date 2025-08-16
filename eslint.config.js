import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/dev-dist/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/workbox-*.js',
      '*.min.js',
      '.env*',
      '**/public/**',
      'frontend/.storybook/**',
      'frontend/src/components/a11y/**',
      // Ignore test files temporarily
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/__tests__/**',
      // Ignore problematic files for now
      'backend/**/*.js',
      'frontend/lib/**',
      'backend/src/test-*.ts',
    ],
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
      noInlineConfig: false,
    },
  },
  // Frontend configuration
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["frontend/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/exhaustive-deps": "warn",
      'no-console': "off",
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
  // Backend configuration
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["backend/src/**/*.ts"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      'no-console': ["error", { "allow": ["warn", "error"] }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
    },
  },
);
