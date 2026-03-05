module.exports = {
  env: { es2021: true, node: true, browser: true },
  extends: ["eslint:recommended", "plugin:import/recommended", "prettier"],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  rules: {
    "no-unused-vars": ["warn"],
    "import/no-unresolved": "off"
  },
};
