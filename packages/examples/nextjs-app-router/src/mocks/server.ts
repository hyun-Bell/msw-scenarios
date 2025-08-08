import { workerManager } from '@msw-scenarios/core';

// 서버 사이드에서의 MSW 초기화 (테스트용)
export async function initMSWServer() {
  if (typeof window !== 'undefined') {
    return;
  }

  // 테스트 환경에서 MSW 서버 시작
  if (process.env.NODE_ENV === 'test') {
    try {
      // 동적 import로 MSW node 모듈 로드
      const { setupServer } = await import('msw/node');
      
      // Server 생성
      const server = setupServer();
      
      // Worker Manager에 등록
      workerManager.setupServer(server);
      
      // Server 시작
      server.listen({
        onUnhandledRequest: 'bypass',
      });
    } catch (error) {
      console.error('MSW Server 초기화 실패:', error);
    }
  }
}