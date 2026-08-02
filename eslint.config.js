import js from "@eslint/js";
import globals from "globals";
import html from "eslint-plugin-html";
import prettier from "eslint-config-prettier";

export default [
  {
    ignores: ["node_modules/**", "assets/**", "backend/.wrangler/**", ".wrangler/**"],
  },
  {
    plugins: { html },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
  prettier,
  {
    files: ["js/*.js"],
    languageOptions: {
      sourceType: "script",
      globals: globals.browser,
    },
  },
  {
    files: ["backend/src/worker.js"],
    languageOptions: {
      sourceType: "module",
      globals: { ...globals.worker, console: "readonly" },
    },
  },
  {
    files: ["backend/scripts/*.mjs", "test/**/*.mjs", "eslint.config.js"],
    languageOptions: {
      sourceType: "module",
      globals: globals.node,
    },
  },
  {
    files: ["admin/**/*.html"],
    languageOptions: {
      sourceType: "script",
      globals: globals.browser,
    },
  },
];
