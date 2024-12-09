import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// MSW 타입 정의
declare global {
  interface Window {
    __msw__: {
      worker: any;
      handlers: any;
    };
  }
}

// 테스트 헬퍼 함수들
export const mockApi = async (
  page: Page,
  options: {
    method: string;
    path: string;
    preset: string;
    override?: (data: any) => void;
  }
) => {
  await page.evaluate((opts) => {
    window.__msw__.handlers.useMock(opts);
  }, options);
};

export const clearMocks = async (page: Page) => {
  await page.evaluate(() => {
    window.__msw__.handlers.reset();
  });
};

// 커스텀 테스트 픽스처
export const test = base.extend({
  // 인증된 페이지 픽스처
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/');

    // 로그인 모킹
    await mockApi(page, {
      method: 'post',
      path: '/api/login',
      preset: 'success',
    });

    // 로그인 수행
    await page.getByTestId('username').fill('testuser');
    await page.getByTestId('password').fill('password');
    await page.getByTestId('login-button').click();

    // 페이지가 사용자 목록으로 이동할 때까지 대기
    await page.waitForURL('/users');

    await use(page);
  },
});

// 테스트 유틸리티
export const waitForNetworkIdle = async (page: Page, timeout = 1000) => {
  await new Promise((resolve) => setTimeout(resolve, timeout));
  await page.waitForLoadState('networkidle');
};

export const clearLocalStorage = async (page: Page) => {
  await page.evaluate(() => {
    localStorage.clear();
  });
};

export { expect };
