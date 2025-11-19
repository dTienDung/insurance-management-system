module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // Code Quality
    'no-unused-vars': 'warn',
    'no-console': 'off', // Allow console for logging
    'no-undef': 'error',
    
    // Best Practices
    'eqeqeq': ['error', 'always'], // Require === and !==
    'curly': ['error', 'all'], // Require curly braces
    'no-var': 'error', // Use let/const instead of var
    'prefer-const': 'warn',
    
    // Async/Await
    'no-async-promise-executor': 'error',
    'require-await': 'warn',
    
    // Security
    'no-eval': 'error',
    'no-implied-eval': 'error',
    
    // Style (minimal)
    'indent': ['error', 2, { 'SwitchCase': 1 }],
    'quotes': ['error', 'single', { 'avoidEscape': true }],
    'semi': ['error', 'always']
  },
  ignorePatterns: [
    'node_modules/',
    'coverage/',
    '*.min.js'
  ]
};
