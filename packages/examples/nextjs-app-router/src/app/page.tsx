'use client';

import ApiTester from '@/components/ApiTester';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            MSW Scenarios Example
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            React Query DevTools처럼 동작하는 MSW DevTools
          </p>
          <div className="text-sm text-gray-500 space-y-2">
            <p>✅ window 객체 조작 불필요 - MockClient가 모든 것을 처리</p>
            <p>✅ 선언적 API - MockClientProvider로 간단하게 설정</p>
            <p>
              🎆 우측 하단의 플로팅 버튼을 클릭하거나 Ctrl+Shift+M을 눌러
              DevTools를 열어보세요.
            </p>
          </div>
        </div>

        <ApiTester />

        {/* 사용법 설명 */}
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🚀 사용법 (새로운 MockClient 패턴)
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">
                1. MockClient 생성
              </h3>
              <pre className="bg-gray-100 p-3 rounded text-sm">
                {`import { MockClient } from '@msw-scenarios/core';
import { handlers } from './handlers';

const mockClient = new MockClient();
await mockClient.registerHandlers(handlers);`}
              </pre>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">
                2. Provider로 감싸기
              </h3>
              <pre className="bg-gray-100 p-3 rounded text-sm">
                {`import { MockClientProvider } from '@msw-scenarios/core';
import { MswDevtools } from '@msw-scenarios/react-devtools';

<MockClientProvider client={mockClient}>
  <App />
  <MswDevtools />
</MockClientProvider>`}
              </pre>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">3. 끝! 🎉</h3>
              <p className="text-gray-600">
                이제 DevTools가 자동으로 MockClient와 연결되어 모든 프리셋과
                프로필을 관리할 수 있습니다. window 객체를 직접 다룰 필요가
                없습니다!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
