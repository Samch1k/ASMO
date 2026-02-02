import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    rules: {
      // Relax some rules for development
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/ban-ts-comment': ['warn', {
        'ts-nocheck': 'allow-with-description'
      }],
      'no-console': 'off',
      'no-case-declarations': 'off'
    }
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '**/*.js',
      '**/*.mjs',
      'coverage/**',
      'jest.config.js',
      'tsup.config.ts'
    ]
  }
)
