'use client';

import { useEffect, ReactNode } from 'react';
import { initMSW } from '@/mocks/browser';

interface MSWProviderProps {
  children: ReactNode;
}

export function MSWProvider({ children }: MSWProviderProps) {
  useEffect(() => {
    // 브라우저 환경에서만 MSW 초기화
    if (
      typeof window !== 'undefined' &&
      process.env.NODE_ENV === 'development'
    ) {
      initMSW().catch(console.error);
    }
  }, []);

  return <>{children}</>;
}
