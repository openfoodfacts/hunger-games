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
  js.configs.recommended,

  // TypeScript
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: "latest",
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
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
      react: { version: "detect" },
    },
    rules: {
      "react/prop-types": "off",
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
