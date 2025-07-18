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
    ],
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
      noInlineConfig: false,
    },
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
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
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/exhaustive-deps": "warn", // Allow warnings for complex dependencies
      'no-console': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      'no-warning-comments': [
        'error',
        { terms: ['todo', 'fixme'], location: 'anywhere' }
      ],
    },
  },
);
