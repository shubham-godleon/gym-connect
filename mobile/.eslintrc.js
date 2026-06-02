module.exports = {
  root: true,
  extends: ["prettier", "react-app"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react"],
  env: {
    browser: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    "no-unused-vars": "warn",
    "react/react-in-jsx-scope": "off",
  },
};
