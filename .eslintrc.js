module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: 'airbnb-base',
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-console': 0,
    'no-plusplus': 0,
    camelcase: 0,
    'no-continue': 0,
    'linebreak-style': ['error', 'windows'],
    'one-var-declaration-per-line': 0,
    'one-var': 0,
    'no-await-in-loop': 0,
    'no-param-reassign': 0,
    'no-restricted-syntax': 0,
    'max-len': ['error', {
      code: 140,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreComments: true,
    }],
  },
};
