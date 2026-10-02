const js = require('@eslint/js');
const globals = require('globals');
const eslintConfigPrettier = require('eslint-config-prettier/flat');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node,
    },
  },
  // Must stay last: turns off every rule that overlaps Prettier's formatting.
  eslintConfigPrettier,
];
