import js from '@eslint/js';
import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

export default [
  { ignores: ['dist/', 'node_modules/'] },
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    languageOptions: {
      globals: globals.browser,
    },
  },
  // Must stay last: turns off every rule that overlaps Prettier's formatting.
  eslintConfigPrettier,
];
