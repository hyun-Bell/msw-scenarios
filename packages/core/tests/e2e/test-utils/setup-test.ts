import { chromium, Browser, BrowserContext } from '@playwright/test';

let browser: Browser;
let context: BrowserContext;

beforeAll(async () => {
  browser = await chromium.launch();
});

afterAll(async () => {
  await browser.close();
});

beforeEach(async () => {
  context = await browser.newContext();

  // MSW 설정 주입
  await context.addInitScript(() => {
    window.__msw__ = {
      handlers: null,
      worker: null,
    };
  });
});

afterEach(async () => {
  await context.close();
});
