const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const security = require("eslint-plugin-security");

module.exports = defineConfig([
  expoConfig,
  security.configs.recommended,
  {
    ignores: ["dist/*"],
  },
]);
