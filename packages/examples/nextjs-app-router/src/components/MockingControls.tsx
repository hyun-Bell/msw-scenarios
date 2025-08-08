'use client';

import { useState, useEffect } from 'react';
import { handlers } from '@/mocks/handlers';
import clsx from 'clsx';

interface MockingControlsProps {
  onUpdate?: () => void;
}

interface MockingStatus {
  path: string;
  method: string;
  currentPreset: string | null;
}

export function MockingControls({ onUpdate }: MockingControlsProps) {
  const [status, setStatus] = useState<MockingStatus[]>([]);

  useEffect(() => {
    // 초기 상태 로드
    const currentStatus = handlers.getCurrentStatus();
    setStatus([...currentStatus]);

    // 상태 변경 구독
    const unsubscribe = handlers.subscribeToChanges((newStatus) => {
      setStatus([...newStatus.status]);
    });

    return unsubscribe;
  }, []);

  const handlePresetChange = (method: string, path: string, preset: string) => {
    if (preset === 'real-api') {
      handlers.useRealAPI({ method: method as any, path: path as any });
    } else {
      handlers.useMock({ 
        method: method as any, 
        path: path as any, 
        preset: preset as any 
      });
    }
    onUpdate?.();
  };

  const handleReset = () => {
    handlers.reset();
    onUpdate?.();
  };

  // 사용 가능한 프리셋 옵션
  const presetOptions = [
    { value: 'default', label: '기본값', description: '기본 응답' },
    { value: 'success', label: '성공', description: '정상적인 사용자 목록' },
    { value: 'empty', label: '빈 목록', description: '사용자 없음' },
    { value: 'loading', label: '로딩', description: '3초 지연 응답' },
    { value: 'server_error', label: '서버 오류', description: '500 Internal Server Error' },
    { value: 'network_error', label: '네트워크 오류', description: '503 Service Unavailable' },
    { value: 'unauthorized', label: '인증 오류', description: '401 Unauthorized' },
    { value: 'real-api', label: '실제 API', description: '실제 API 호출' },
  ];

  const getPresetInfo = (presetName: string | null) => {
    if (!presetName) return { label: '선택 없음', description: '', color: 'gray' };
    
    const preset = presetOptions.find(p => p.value === presetName);
    if (!preset) return { label: presetName, description: '', color: 'gray' };

    let color = 'blue';
    if (presetName === 'success') color = 'green';
    else if (presetName === 'empty') color = 'yellow';
    else if (presetName === 'loading') color = 'purple';
    else if (presetName.includes('error')) color = 'red';
    else if (presetName === 'real-api') color = 'indigo';

    return { ...preset, color };
  };

  return (
    <div className="space-y-6">
      {/* 전체 초기화 버튼 */}
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-700">
          개별 프리셋 제어
        </h4>
        <button
          onClick={handleReset}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          전체 초기화
        </button>
      </div>

      {/* API 엔드포인트별 제어 */}
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h5 className="text-sm font-medium text-gray-900">
                GET /api/users
              </h5>
              <p className="text-xs text-gray-500">사용자 목록 조회</p>
            </div>
            {(() => {
              const userStatus = status.find(s => s.method === 'get' && s.path === '/api/users');
              const presetInfo = userStatus?.currentPreset ? getPresetInfo(userStatus.currentPreset) : null;
              const color = presetInfo?.color || 'gray';
              const label = presetInfo?.label || 'None';
              
              return userStatus ? (
                <span className={clsx(
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  `bg-${color}-100`,
                  `text-${color}-800`
                )}>
                  {label}
                </span>
              ) : null;
            })()}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {presetOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handlePresetChange('get', '/api/users', option.value)}
                className={clsx(
                  'text-left px-3 py-2 text-sm rounded-md border transition-colors',
                  status.find(s => s.method === 'get' && s.path === '/api/users')?.currentPreset === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                )}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-gray-500">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h5 className="text-sm font-medium text-gray-900">
                POST /api/users
              </h5>
              <p className="text-xs text-gray-500">사용자 생성</p>
            </div>
            {(() => {
              const postStatus = status.find(s => s.method === 'post' && s.path === '/api/users');
              const presetInfo = postStatus?.currentPreset ? getPresetInfo(postStatus.currentPreset) : null;
              const color = presetInfo?.color || 'gray';
              const label = presetInfo?.label || 'None';
              
              return postStatus ? (
                <span className={clsx(
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  `bg-${color}-100`,
                  `text-${color}-800`
                )}>
                  {label}
                </span>
              ) : null;
            })()}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'default', label: '기본값', description: '성공적인 생성' },
              { value: 'success', label: '성공', description: '201 Created' },
              { value: 'validation_error', label: '유효성 오류', description: '400 Bad Request' },
              { value: 'duplicate_error', label: '중복 오류', description: '409 Conflict' },
              { value: 'real-api', label: '실제 API', description: '실제 API 호출' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handlePresetChange('post', '/api/users', option.value)}
                className={clsx(
                  'text-left px-3 py-2 text-sm rounded-md border transition-colors',
                  status.find(s => s.method === 'post' && s.path === '/api/users')?.currentPreset === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                )}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-gray-500">{option.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}