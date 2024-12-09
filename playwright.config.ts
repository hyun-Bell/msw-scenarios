import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // 테스트 파일 위치 지정
  testDir: './tests/e2e/specs',

  // 테스트 파일 패턴 설정
  testMatch: '**/*.spec.ts',

  // 동시 실행 설정
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,

  // 테스트 재시도 설정
  retries: process.env.CI ? 2 : 0,

  // 리포터 설정
  reporter: process.env.CI ? 'github' : [['html', { open: 'never' }]],

  // 전역 설정
  use: {
    // 기본 URL
    baseURL: 'http://localhost:3001',

    // 트레이스 설정
    trace: 'retain-on-failure',

    // 스크린샷 설정
    screenshot: 'only-on-failure',

    // 비디오 설정
    video: 'retain-on-failure',

    // 타임아웃 설정
    actionTimeout: 10_000,
    navigationTimeout: 15_000,

    // 기타 설정
    testIdAttribute: 'data-testid',
  },

  // 웹 서버 설정
  webServer: {
    command: 'npm run test:e2e:dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      E2E_TEST: 'true',
      NEXT_PUBLIC_API_MOCKING: 'enabled',
    },
  },

  // 프로젝트별 설정
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
});
