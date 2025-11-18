import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['node_modules', 'dist', 'build', 'coverage', '*.min.js'],
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      // Best practices
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'off', // Allow console in Node.js backend
      'prefer-const': 'error',
      'no-var': 'error',

      // ES6+
      'arrow-body-style': ['error', 'as-needed'],
      'prefer-arrow-callback': 'error',
      'prefer-template': 'error',

      // Code quality
      eqeqeq: ['error', 'always'],
      'no-throw-literal': 'error',
      'require-await': 'error',
    },
  },
  prettier,
];
