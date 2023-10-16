module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: ['eslint:recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 13,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/ban-types': [
      'error',
      { types: { '{}': false, Function: false }, extendDefaults: true }
    ],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'no-control-regex': 0
  }
}
