'use client';

import { useEffect, ReactNode, useState } from 'react';
import { initMSW } from '@/mocks/browser';

interface MSWProviderProps {
  children: ReactNode;
}

export function MSWProvider({ children }: MSWProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 브라우저 환경에서만 MSW 초기화
    if (
      typeof window !== 'undefined' &&
      process.env.NODE_ENV === 'development'
    ) {
      initMSW()
        .then(() => {
          setIsReady(true);
        })
        .catch(console.error);
    } else {
      setIsReady(true);
    }
  }, []);

  // MSW가 초기화되기 전에는 로딩 표시
  if (!isReady && process.env.NODE_ENV === 'development') {
    return <div style={{ opacity: 0 }}>{children}</div>;
  }

  // 직접 children 반환 - MockClientProvider 제거
  return <>{children}</>;
}
