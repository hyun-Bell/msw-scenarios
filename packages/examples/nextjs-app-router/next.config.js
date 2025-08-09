/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@msw-scenarios/core', '@msw-scenarios/react-devtools'],
  // MSW를 서버 사이드에서 external로 처리
  serverExternalPackages: ['msw'],
};

module.exports = nextConfig;
