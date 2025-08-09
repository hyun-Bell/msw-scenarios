import { MockClient } from '@msw-scenarios/core';
import { handlers } from './handlers';

// Create and export MockClient instance
export const mockClient = new MockClient({
  onUnhandledRequest: 'bypass',
  serviceWorker: {
    url: '/mockServiceWorker.js',
  },
});

// Initialize MSW with MockClient
export async function initMSW() {
  if (typeof window === 'undefined') {
    return;
  }

  // 개발 환경에서만 MSW 활성화
  if (process.env.NODE_ENV === 'development') {
    try {
      console.log('[browser.ts] Starting MSW initialization...');
      console.log('[browser.ts] Handlers object:', handlers);
      console.log(
        '[browser.ts] Handlers count:',
        handlers.handlers?.length || 0
      );
      console.log(
        '[browser.ts] Has useMock:',
        typeof handlers.useMock === 'function'
      );

      // Register handlers with MockClient
      await mockClient.registerHandlers(handlers);
      // Verify the connection
      console.log(
        '[browser.ts] MockClient handlers:',
        mockClient.getHandlers()
      );
      console.log(
        '[browser.ts] MockClient initialized:',
        mockClient.isInitialized()
      );

      console.log('✅ MSW가 성공적으로 초기화되었습니다.');

      // Test preset toggling
      if (handlers.handlers && handlers.handlers.length > 0) {
        const firstHandler = handlers.handlers[0] as any;
        if (firstHandler._presets) {
          console.log(
            '[browser.ts] First handler presets:',
            firstHandler._presets.map((p: any) => p.label)
          );
        }
      }

      return mockClient;
    } catch (error) {
      console.error('MSW 초기화 실패:', error);
    }
  }
}
