'use client';

import { useState, useEffect } from 'react';
import { profiles } from '@/mocks/handlers';
import clsx from 'clsx';

interface ProfileSwitcherProps {
  onUpdate?: () => void;
}

export function ProfileSwitcher({ onUpdate }: ProfileSwitcherProps) {
  const [currentProfile, setCurrentProfile] = useState<string | null>(null);
  const [availableProfiles] = useState(profiles.getAvailableProfiles());

  useEffect(() => {
    // 초기 프로필 상태 로드
    setCurrentProfile(profiles.getCurrentProfile());

    // 프로필 변경 구독
    const unsubscribe = profiles.subscribeToChanges((newProfile) => {
      setCurrentProfile(newProfile);
    });

    return unsubscribe;
  }, []);

  const handleProfileChange = (profileName: string) => {
    profiles.useMock(profileName as any);
    onUpdate?.();
  };

  const handleReset = () => {
    profiles.reset();
    onUpdate?.();
  };

  // 프로필별 설명 정보
  const profileDescriptions = {
    '정상 상태': {
      description: '모든 API가 정상적으로 동작하는 상태',
      features: ['사용자 목록 조회 성공', '사용자 생성 성공'],
      color: 'green',
      icon: '✅',
    },
    '빈 상태': {
      description: '데이터가 없는 초기 상태',
      features: ['빈 사용자 목록', '사용자 생성 가능'],
      color: 'yellow',
      icon: '📋',
    },
    '로딩 상태': {
      description: '네트워크가 느려서 응답이 지연되는 상태',
      features: ['3초 지연된 응답', '로딩 인디케이터 테스트'],
      color: 'purple',
      icon: '⏳',
    },
    '오류 상태': {
      description: '서버에서 오류가 발생하는 상태',
      features: ['서버 내부 오류', '유효성 검사 실패'],
      color: 'red',
      icon: '❌',
    },
    '권한 오류': {
      description: '인증이 필요한 상태',
      features: ['401 Unauthorized', '로그인 필요'],
      color: 'orange',
      icon: '🔒',
    },
  };

  const getProfileInfo = (profileName: string) => {
    return profileDescriptions[profileName as keyof typeof profileDescriptions] || {
      description: '알 수 없는 프로필',
      features: [],
      color: 'gray',
      icon: '❓',
    };
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-700">
          프로필 기반 시나리오
        </h4>
        <button
          onClick={handleReset}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          프로필 초기화
        </button>
      </div>

      {/* 현재 활성 프로필 표시 */}
      {currentProfile && (
        <div className={clsx(
          'rounded-lg p-4 border-l-4',
          `border-${getProfileInfo(currentProfile).color}-500`,
          `bg-${getProfileInfo(currentProfile).color}-50`
        )}>
          <div className="flex items-center">
            <span className="text-lg mr-2">{getProfileInfo(currentProfile).icon}</span>
            <div>
              <h5 className={clsx(
                'text-sm font-medium',
                `text-${getProfileInfo(currentProfile).color}-800`
              )}>
                현재 활성: {currentProfile}
              </h5>
              <p className={clsx(
                'text-xs mt-1',
                `text-${getProfileInfo(currentProfile).color}-600`
              )}>
                {getProfileInfo(currentProfile).description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 프로필 선택 */}
      <div className="grid grid-cols-1 gap-3">
        {availableProfiles.map((profileName) => {
          const info = getProfileInfo(profileName);
          const isActive = currentProfile === profileName;
          
          return (
            <button
              key={profileName}
              onClick={() => handleProfileChange(profileName)}
              className={clsx(
                'text-left p-4 rounded-lg border transition-all duration-200',
                isActive
                  ? `border-${info.color}-500 bg-${info.color}-50 ring-2 ring-${info.color}-200`
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              )}
            >
              <div className="flex items-start">
                <span className="text-xl mr-3 flex-shrink-0">{info.icon}</span>
                <div className="flex-1 min-w-0">
                  <h5 className={clsx(
                    'text-sm font-medium',
                    isActive ? `text-${info.color}-800` : 'text-gray-900'
                  )}>
                    {profileName}
                  </h5>
                  <p className={clsx(
                    'text-xs mt-1',
                    isActive ? `text-${info.color}-600` : 'text-gray-500'
                  )}>
                    {info.description}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {info.features.map((feature, index) => (
                      <li 
                        key={index}
                        className={clsx(
                          'text-xs flex items-center',
                          isActive ? `text-${info.color}-700` : 'text-gray-600'
                        )}
                      >
                        <span className="w-1 h-1 bg-current rounded-full mr-2 flex-shrink-0"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                {isActive && (
                  <div className={clsx(
                    'ml-2 flex-shrink-0 w-2 h-2 rounded-full',
                    `bg-${info.color}-500`
                  )}></div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 도움말 */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
        <p className="font-medium mb-1">💡 프로필 사용법:</p>
        <p>프로필을 선택하면 관련된 모든 API 엔드포인트가 해당 시나리오에 맞게 자동으로 설정됩니다. 우측 하단의 DevTools에서도 같은 기능을 사용할 수 있습니다.</p>
      </div>
    </div>
  );
}