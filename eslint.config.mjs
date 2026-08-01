import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),

  // JS base — applies everywhere
  {
    ...js.configs.recommended,
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": "off",
      "preserve-caught-error": "off",
    },
  },

  // TypeScript
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [tseslint.configs.recommended],
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: "latest",
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
    },
  },

  // React
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    extends: [react.configs.flat.recommended],
    languageOptions: {
      globals: globals.browser,
    },
    settings: {
      react: { version: "19.2" },
    },
    rules: {
      "react/prop-types": "off",
      "react/jsx-key": "off",
      "react/no-children-prop": "off",
    },
  },

  // JSX runtime
  {
    files: ["src/**/*.{jsx,tsx}"],
    extends: [react.configs.flat["jsx-runtime"]],
  },

  // React Hooks + Refresh
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-refresh/only-export-components": "off",
    },
  },

  // Node globals
  {
    files: ["vite.config.*", "*.config.{js,mjs,cjs}", "*.config.ts", "*.js"],
    languageOptions: {
      globals: globals.node,
      ecmaVersion: "latest",
    },
  },

  // Service Worker
  {
    files: ["**/serviceWorker.js", "**/sw.js"],
    languageOptions: {
      globals: globals.serviceworker,
    },
  },
]);
