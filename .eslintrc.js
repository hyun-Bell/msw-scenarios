module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended', // Prettier와의 통합을 원할 경우
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: ['./tsconfig.json'], // TypeScript 설정 파일 경로
    },
    plugins: [
        '@typescript-eslint',
        'prettier', // Prettier와의 통합을 원할 경우
    ],
    rules: {
        'prettier/prettier': 'error', // Prettier 형식 오류를 ESLint 오류로 표시
        'no-unused-vars': 'off', // TypeScript에서 처리하므로 비활성화
        '@typescript-eslint/no-unused-vars': ['error'],
        'semi': ['error', 'always'],
        'quotes': ['error', 'single'],
        // 추가 규칙을 여기에 작성
    },
};
