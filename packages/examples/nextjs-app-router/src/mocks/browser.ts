import { workerManager } from '@msw-scenarios/core';

// 동적으로 MSW worker를 가져오고 초기화
export async function initMSW() {
  if (typeof window === 'undefined') {
    return;
  }

  // 개발 환경에서만 MSW 활성화
  if (process.env.NODE_ENV === 'development') {
    try {
      // 동적 import로 MSW browser 모듈 로드
      const { setupWorker } = await import('msw/browser');
      
      // Worker 생성
      const worker = setupWorker();
      
      // Worker Manager에 등록
      workerManager.setupWorker(worker);
      
      // Worker 시작
      return worker.start({
        onUnhandledRequest: 'bypass',
        quiet: false,
      });
    } catch (error) {
      console.error('MSW 초기화 실패:', error);
    }
  }
}