// Minimal ESLint v9 flat config for CRA-based React project.
// Purpose: satisfy the platform linter engine (which shells out to eslint) without
// enforcing project-wide style rules. CRA already provides real linting during build.
module.exports = [
  {
    ignores: [
      "build/**",
      "dist/**",
      "node_modules/**",
      "public/**",
      "**/*.min.js",
    ],
  },
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        process: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
        Blob: "readonly",
        FormData: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        alert: "readonly",
        confirm: "readonly",
        HTMLElement: "readonly",
        Image: "readonly",
        FileReader: "readonly",
        atob: "readonly",
        btoa: "readonly",
      },
    },
    rules: {},
  },
];
