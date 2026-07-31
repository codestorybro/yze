const { defineConfig, globalIgnores } = require("eslint/config")
const expoConfig = require("eslint-config-expo/flat")
const prettierRecommended = require("eslint-plugin-prettier/recommended")

module.exports = defineConfig([
  globalIgnores([
    ".expo/**",
    "android/**",
    "coverage/**",
    "dist/**",
    "expo-env.d.ts",
    "ios/**",
    "node_modules/**",
  ]),
  expoConfig,
  prettierRecommended,
  {
    rules: {
      "import/order": [
        "error",
        {
          "alphabetize": { order: "asc", caseInsensitive: true },
          "distinctGroup": false,
          "groups": [
            ["builtin", "external"],
            "internal",
            "unknown",
            ["parent", "sibling"],
            "index",
          ],
          "newlines-between": "always",
          "pathGroups": [
            { pattern: "react", group: "external", position: "before" },
            { pattern: "react-native", group: "external", position: "before" },
            { pattern: "expo{,-*}", group: "external", position: "before" },
            { pattern: "@/**", group: "unknown", position: "after" },
          ],
          "pathGroupsExcludedImportTypes": ["react", "react-native", "expo", "expo-*"],
        },
      ],
      "import/no-named-as-default-member": "off",
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react",
              importNames: ["default"],
              message: "Import named exports from 'react' instead.",
            },
            {
              name: "react-native",
              importNames: ["SafeAreaView"],
              message: "Use SafeAreaView from 'react-native-safe-area-context' instead.",
            },
            {
              name: "react-native",
              importNames: ["Text", "Button", "TextInput"],
              message: "Use the custom wrapper component from '@/components' instead.",
            },
          ],
        },
      ],
      "no-use-before-define": "off",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-var-requires": "off",
    },
  },
])
