'use client';

import { useState } from 'react';
import { UserList } from '@/components/UserList';
import { MockingControls } from '@/components/MockingControls';
import { ProfileSwitcher } from '@/components/ProfileSwitcher';

export default function HomePage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          사용자 관리 대시보드
        </h2>
        <p className="mt-2 text-gray-600">
          MSW Scenarios를 사용한 API 모킹 예제입니다. 
          아래 컨트롤을 사용하여 다양한 API 응답 시나리오를 테스트할 수 있습니다.
        </p>
      </div>

      {/* 기능 설명 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          주요 기능
        </h3>
        <ul className="text-blue-800 space-y-1 text-sm">
          <li>• <strong>프리셋 관리:</strong> 성공, 오류, 로딩 등 다양한 API 응답 시나리오</li>
          <li>• <strong>프로필 관리:</strong> 여러 프리셋을 조합한 테스트 시나리오</li>
          <li>• <strong>실시간 전환:</strong> 실제 API와 목 데이터 간 즉시 전환</li>
          <li>• <strong>DevTools:</strong> 우측 하단의 도구를 통한 시각적 제어</li>
        </ul>
      </div>

      {/* 컨트롤 패널 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            개별 프리셋 제어
          </h3>
          <MockingControls onUpdate={handleRefresh} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            프로필 기반 시나리오
          </h3>
          <ProfileSwitcher onUpdate={handleRefresh} />
        </div>
      </div>

      {/* 사용자 목록 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              사용자 목록
            </h3>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              새로고침
            </button>
          </div>
        </div>
        <div className="p-6">
          <UserList key={refreshKey} />
        </div>
      </div>
    </div>
  );
}