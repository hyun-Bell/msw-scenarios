'use client';

import { MswDevtools } from '@msw-scenarios/react-devtools';

export function DevToolsProvider() {
  // 개발 환경에서만 DevTools 표시
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return <MswDevtools />;
}
