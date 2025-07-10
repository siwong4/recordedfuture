const prettier = require('eslint-plugin-prettier');
const babelParser = require('@babel/eslint-parser');
const pluginJest = require('eslint-plugin-jest');

module.exports = [
  {
    files: ['**/*.js', '**/*.test.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parser: babelParser,
      parserOptions: {
        allowImportExportEverywhere: true,
        requireConfigFile: false,
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        ChiliPiper: 'readonly',
        hbspt: 'readonly',
        _satellite: 'readonly',
        DOMPurify: 'readonly',
      },
    },
    plugins: {
      prettier,
      jest: pluginJest,
    },
    rules: {
      'linebreak-style': ['error', 'unix'], // enforce unix linebreaks
      'no-param-reassign': [2, { props: false }], // allow modifying properties of param
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'prettier/prettier': 'error',
      'no-await-in-loop': 'off',
      'no-restricted-syntax': 'off',
      semi: ['warn', 'always'],
    },
    ignores: [
      'helix-importer-ui',
      'node_modules/',
      'actions/',
      '.github/actions/',
      'coverage/',
      'dist/',
      '**/*.min.js',
    ],
  },
];
