import { Page } from '@playwright/test';
import { handlers } from '../test-app/mocks/handlers';

export async function initializeMSW(page: Page) {
  // MSW 핸들러를 window 객체에 주입
  await page.addInitScript(() => {
    window.__msw__ = {
      worker: null,
      handlers: null,
    };
  });

  // handlers 객체 주입
  await page.evaluate((handlersObj) => {
    window.__msw__.handlers = handlersObj;
  }, handlers);
}

export async function mockApi(
  page: Page,
  options: {
    method: string;
    path: string;
    preset: string;
    override?: (data: any) => void;
  }
) {
  await page.evaluate((opts) => {
    window.__msw__.handlers.useMock(opts);
  }, options);
}
