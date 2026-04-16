export default [
  {
    ignores: ["node_modules/**", ".next/**", "dist/**", "coverage/**"]
  },
  {
    files: ["**/*.{js,jsx,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      "no-console": "off",
      "no-undef": "off",
      "no-unused-vars": "off"
    }
  }
];
