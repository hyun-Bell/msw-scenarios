'use client';

import { MswDevtools } from '@msw-scenarios/react-devtools';

export function DevToolsProvider() {
  // 개발 환경에서만 DevTools 표시
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // CSS-in-JS로 스타일 주입된 독립 실행형 DevTools
  // MockClient를 자동으로 감지하여 연결
  return (
    <MswDevtools
      defaultOpen={false}
      position="bottom-right"
      enableKeyboardShortcuts={true}
    />
  );
}
