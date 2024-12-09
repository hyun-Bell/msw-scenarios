// tests/e2e/specs/user-management.spec.ts
import { expect, test } from '@playwright/test';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // MSW가 초기화될 때까지 기다림
    await page.waitForFunction(() => window.mswHandlers !== undefined);
  });

  test('successful login and view users', async ({ page }) => {
    // Mock 설정을 먼저 해두고
    await page.evaluate(() => {
      window.mswHandlers.useMock({
        method: 'post',
        path: '/api/login',
        preset: 'success',
      });
      window.mswHandlers.useMock({
        method: 'get',
        path: '/api/users',
        preset: 'withUsers',
      });
    });

    // 로그인 수행
    await page.getByTestId('username').fill('testuser');
    await page.getByTestId('password').fill('password');
    await page.getByTestId('login-button').click();

    // URL 변경과 데이터 표시 확인
    await page.waitForURL('/users');
    await expect(page.getByTestId('user-list')).toBeVisible();
    const userItems = await page.getByTestId('user-item').all();
    expect(userItems).toHaveLength(2);
  });

  test('failed login shows error message', async ({ page }) => {
    await page.evaluate(() => {
      window.mswHandlers.useMock({
        method: 'post',
        path: '/api/login',
        preset: 'invalidCredentials',
      });
    });

    await page.getByTestId('username').fill('wrong');
    await page.getByTestId('password').fill('wrong');
    await page.getByTestId('login-button').click();

    await expect(page.getByTestId('error-message')).toBeVisible();
    await expect(page.getByTestId('error-message')).toHaveText(
      'Invalid credentials'
    );
  });

  test('empty users list shows empty state', async ({ page }) => {
    await page.evaluate(() => {
      window.mswHandlers.useMock({
        method: 'post',
        path: '/api/login',
        preset: 'success',
      });
      window.mswHandlers.useMock({
        method: 'get',
        path: '/api/users',
        preset: 'emptyUsers',
      });
    });

    await page.getByTestId('username').fill('testuser');
    await page.getByTestId('password').fill('password');
    await page.getByTestId('login-button').click();

    await page.waitForURL('/users');
    await expect(page.getByTestId('empty-state')).toBeVisible();
    await expect(page.getByTestId('empty-state')).toHaveText('No users found');
  });

  test('logout functionality', async ({ page }) => {
    await page.evaluate(() => {
      window.mswHandlers.useMock({
        method: 'post',
        path: '/api/login',
        preset: 'success',
      });
      window.mswHandlers.useMock({
        method: 'get',
        path: '/api/users',
        preset: 'withUsers',
      });
    });

    await page.getByTestId('username').fill('testuser');
    await page.getByTestId('password').fill('password');
    await page.getByTestId('login-button').click();

    await page.waitForURL('/users');
    await expect(page.getByTestId('logout-button')).toBeVisible();
    await page.getByTestId('logout-button').click();

    await expect(page).toHaveURL('/');
  });

  test('user role display', async ({ page }) => {
    await page.evaluate(() => {
      window.mswHandlers.useMock({
        method: 'post',
        path: '/api/login',
        preset: 'success',
      });
      window.mswHandlers.useMock({
        method: 'get',
        path: '/api/users',
        preset: 'withUsers',
        override: ({ data }) => {
          data.users = [
            { id: 1, name: 'John', role: 'admin', email: 'john@example.com' },
            { id: 2, name: 'Jane', role: 'user', email: 'jane@example.com' },
          ];
        },
      });
    });

    await page.getByTestId('username').fill('testuser');
    await page.getByTestId('password').fill('password');
    await page.getByTestId('login-button').click();

    await page.waitForURL('/users');
    await expect(page.getByTestId('user-list')).toBeVisible();

    // 테스트 ID를 사용하여 role 확인
    await expect(page.getByTestId('role-admin')).toBeVisible();
    await expect(page.getByTestId('role-user')).toBeVisible();
  });
});
