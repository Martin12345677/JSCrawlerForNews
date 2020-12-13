module.exports = {
  extends: [
    '@tencent/eslint-config-tencent',
    '@tencent/eslint-config-tencent/ts',
  ],
  globals: {
    COS_PATH: true,
  },
  rules: {
    complexity: ['error', 30],
    // 不加这个 cos-js-sdk-v5.d.ts 中 constructor 的声明会报错
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': 'error',
  },
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaFeatures: {
      jsx: true,
    },
  },
};
