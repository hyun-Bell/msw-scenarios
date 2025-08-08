// tests/e2e/test-app/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: 'test-dist',
  webpack: (config) => {
    // src 디렉토리의 파일들을 트랜스파일하도록 설정
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      include: /src/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      ],
    });

    // msw의 exports 필드를 올바르게 처리하기 위한 설정
    config.resolve = {
      ...config.resolve,
      extensionAlias: {
        '.js': ['.js', '.ts', '.tsx'],
      },
      conditionNames: ['browser', 'require', 'import'],
    };

    return config;
  },
};

module.exports = nextConfig;
