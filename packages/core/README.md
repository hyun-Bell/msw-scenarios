# @msw-scenarios/core

<p align="center">
  <img src="https://github.com/user-attachments/assets/b67bbc6f-bb2b-46ec-8e4a-76652a777f04" alt="msw-scenarios Logo" width="300" style="border-radius: 15px;"/>
</p>

<div align="center">

[![npm version](https://badge.fury.io/js/@msw-scenarios%2Fcore.svg)](https://badge.fury.io/js/@msw-scenarios%2Fcore)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

<div align="center">
  <a href="#installation">설치</a> • 
  <a href="#quick-start">빠른 시작</a> • 
  <a href="#api-reference">API</a> • 
  <a href="#examples">예제</a>
</div>

<br />

**@msw-scenarios/core**는 [MSW (Mock Service Worker) 2.x.x](https://mswjs.io/)를 기반으로 한 **타입 안전한** 프리셋 관리 시스템입니다. API 모킹에 시나리오 기반 접근 방식을 제공하여 개발과 테스트를 더욱 효율적으로 만들어줍니다.

## ✨ 주요 특징

- **🔒 완전한 타입 안전성**: TypeScript 최우선 설계로 컴파일 타임 안전성 보장
- **🔄 MSW 2.x.x 호환**: 최신 MSW와 완벽한 호환성
- **📋 프리셋 시스템**: 각 엔드포인트별 다양한 응답 시나리오 관리
- **👥 프로필 관리**: 여러 프리셋을 조합한 복합 시나리오 생성
- **🎮 실시간 상태 관리**: React 친화적 상태 구독 시스템
- **🛠 개발자 친화적**: 직관적이고 간단한 API 설계

## 📦 설치 {#installation}

```bash
npm install @msw-scenarios/core msw
# or
yarn add @msw-scenarios/core msw
# or
pnpm add @msw-scenarios/core msw
```

### 요구사항

- **Node.js**: >=18
- **MSW**: ^2.6.0 (peer dependency)
- **TypeScript**: ^5.0 (선택사항이지만 권장)

## 🚀 빠른 시작 {#quick-start}

### 1. 핸들러 생성 및 프리셋 정의

```typescript
import { http } from '@msw-scenarios/core';
import { HttpResponse } from 'msw';

// 사용자 API 핸들러 생성
const userHandler = http
  .get('/api/user', () => {
    return HttpResponse.json({ message: 'default user' });
  })
  .presets(
    {
      label: 'success',
      status: 200,
      response: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
      },
    },
    {
      label: 'error',
      status: 404,
      response: { error: 'User not found' },
    }
  );
```

### 2. 브라우저 환경 설정

```typescript
import { extendHandlers, workerManager } from '@msw-scenarios/core';
import { setupWorker } from 'msw/browser';

// 핸들러 확장
const handlers = extendHandlers(userHandler);

// MSW 워커 설정
const worker = setupWorker(...handlers.handlers);

// workerManager에 등록
workerManager.setupWorker(worker);

// 워커 시작
worker.start();
```

### 3. Node.js/테스트 환경 설정

```typescript
import { extendHandlers, workerManager } from '@msw-scenarios/core';
import { setupServer } from 'msw/node';

// 핸들러 확장
const handlers = extendHandlers(userHandler);

// MSW 서버 설정
const server = setupServer(...handlers.handlers);

// workerManager에 등록
workerManager.setupServer(server);

// 테스트 설정
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  workerManager.resetHandlers();
});

afterAll(() => {
  server.close();
});
```

### 4. 프리셋 사용

```typescript
// 성공 시나리오 적용
handlers.useMock({
  method: 'get',
  path: '/api/user',
  preset: 'success',
});

// 오류 시나리오 적용
handlers.useMock({
  method: 'get',
  path: '/api/user',
  preset: 'error',
});

// 실제 API로 전환
handlers.useRealAPI({
  method: 'get',
  path: '/api/user',
});
```

## 🎯 API 레퍼런스 {#api-reference}

### http

MSW의 `http` 객체를 확장하여 프리셋 기능을 추가합니다.

```typescript
import { http } from '@msw-scenarios/core';

const handler = http.get('/api/endpoint', defaultResolver).presets(...presets);
```

#### `.presets(...presets)`

```typescript
interface Preset<T = any> {
  label: string;
  status: number;
  response: T | (() => T) | (() => Promise<T>);
}
```

### extendHandlers

여러 핸들러를 하나의 관리 객체로 결합합니다.

```typescript
import { extendHandlers } from '@msw-scenarios/core';

const handlers = extendHandlers(handler1, handler2, handler3);
```

#### 메서드

- **`useMock(options)`**: 특정 엔드포인트에 프리셋 적용
- **`useRealAPI(options)`**: 실제 API로 전환
- **`createMockProfiles(...profiles)`**: 프로필 생성

### mockingState

전역 모킹 상태를 관리합니다.

```typescript
import { mockingState } from '@msw-scenarios/core';

// 현재 상태 조회
const status = mockingState.getCurrentStatus();
const profile = mockingState.getCurrentProfile();

// 상태 변경 구독
const unsubscribe = mockingState.subscribeToChanges(
  ({ mockingStatus, currentProfile }) => {
    console.log('Status changed:', mockingStatus);
    console.log('Current profile:', currentProfile);
  }
);

// 리셋
mockingState.resetAll();
mockingState.resetEndpoint('get', '/api/user');
```

### workerManager

MSW 워커/서버 생명주기를 관리합니다.

```typescript
import { workerManager } from '@msw-scenarios/core';

// 브라우저
workerManager.setupWorker(worker);

// Node.js
workerManager.setupServer(server);

// 핸들러 리셋
workerManager.resetHandlers();
```

## 🎮 고급 사용법

### 프로필 시스템

여러 프리셋을 조합하여 복합 시나리오를 생성할 수 있습니다.

```typescript
// 여러 핸들러 정의
const userHandler = http.get('/api/user', defaultResolver).presets(
  { label: 'authenticated', status: 200, response: { name: 'John', role: 'admin' } },
  { label: 'guest', status: 200, response: { name: 'Guest', role: 'guest' } }
);

const postsHandler = http.get('/api/posts', defaultResolver).presets(
  { label: 'with-posts', status: 200, response: { posts: [...] } },
  { label: 'empty', status: 200, response: { posts: [] } }
);

const handlers = extendHandlers(userHandler, postsHandler);

// 프로필 생성
const profiles = handlers.createMockProfiles(
  {
    name: '관리자 상태',
    actions: ({ useMock }) => {
      useMock({ method: 'get', path: '/api/user', preset: 'authenticated' });
      useMock({ method: 'get', path: '/api/posts', preset: 'with-posts' });
    }
  },
  {
    name: '빈 상태',
    actions: ({ useMock }) => {
      useMock({ method: 'get', path: '/api/user', preset: 'guest' });
      useMock({ method: 'get', path: '/api/posts', preset: 'empty' });
    }
  }
);

// 프로필 적용
profiles.useMock('관리자 상태');
```

### 동적 응답 및 오버라이드

```typescript
const handler = http.get('/api/user', defaultResolver).presets({
  label: 'dynamic',
  status: 200,
  response: async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 지연
    return { timestamp: Date.now(), user: 'Dynamic User' };
  },
});

// 응답 오버라이드
handlers.useMock({
  method: 'get',
  path: '/api/user',
  preset: 'success',
  override: ({ data }) => {
    data.name = 'Overridden Name';
    data.customField = 'Added field';
  },
});
```

### 타입 안전성

TypeScript를 사용하면 완전한 타입 안전성을 얻을 수 있습니다.

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

interface ApiResponse<T> {
  data: T;
  success: boolean;
}

const userHandler = http
  .get('/api/user', (): HttpResponse => {
    return HttpResponse.json<ApiResponse<User>>({
      data: { id: 0, name: '', email: '', role: 'guest' },
      success: false,
    });
  })
  .presets({
    label: 'success',
    status: 200,
    response: {
      data: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin' as const,
      },
      success: true,
    },
  });

// TypeScript가 타입을 추론하고 검증합니다
handlers.useMock({
  method: 'get',
  path: '/api/user', // ✅ 자동완성됨
  preset: 'success', // ✅ 유효한 프리셋만 표시
  override: ({ data }) => {
    data.data.name = 'Jane Doe'; // ✅ 타입 안전
    // data.data.invalid = true; // ❌ TypeScript 오류
  },
});
```

## 🧪 테스트 통합 {#examples}

### Jest 테스트 예제

```typescript
import { http, extendHandlers, workerManager } from '@msw-scenarios/core';
import { setupServer } from 'msw/node';
import { HttpResponse } from 'msw';

describe('API 모킹 테스트', () => {
  const userHandler = http
    .get('/api/user', () => HttpResponse.json({ message: 'default' }))
    .presets(
      { label: 'success', status: 200, response: { id: 1, name: 'John' } },
      { label: 'error', status: 500, response: { error: 'Server Error' } }
    );

  const handlers = extendHandlers(userHandler);
  const server = setupServer(...handlers.handlers);

  beforeAll(() => {
    workerManager.setupServer(server);
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    workerManager.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it('성공 시나리오 테스트', async () => {
    handlers.useMock({
      method: 'get',
      path: '/api/user',
      preset: 'success',
    });

    const response = await fetch('/api/user');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ id: 1, name: 'John' });
  });

  it('오류 시나리오 테스트', async () => {
    handlers.useMock({
      method: 'get',
      path: '/api/user',
      preset: 'error',
    });

    const response = await fetch('/api/user');
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Server Error' });
  });
});
```

### React 컴포넌트에서 사용

```typescript
import { useEffect, useState } from 'react';
import { mockingState } from '@msw-scenarios/core';

function UserProfile({ handlers, profiles }) {
  const [user, setUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);

  // 프로필 변경 감지
  useEffect(() => {
    return mockingState.subscribeToChanges(({ currentProfile }) => {
      setCurrentProfile(currentProfile);
    });
  }, []);

  // 사용자 데이터 가져오기
  const fetchUser = async () => {
    const response = await fetch('/api/user');
    const userData = await response.json();
    setUser(userData);
  };

  return (
    <div>
      <h3>현재 프로필: {currentProfile || '없음'}</h3>

      <div>
        <button onClick={() => profiles.useMock('성공 상태')}>
          성공 상태
        </button>
        <button onClick={() => profiles.useMock('오류 상태')}>
          오류 상태
        </button>
        <button onClick={() => mockingState.resetAll()}>
          리셋
        </button>
      </div>

      <button onClick={fetchUser}>사용자 정보 가져오기</button>

      {user && (
        <pre>{JSON.stringify(user, null, 2)}</pre>
      )}
    </div>
  );
}
```

## 🔧 환경별 설정

### Next.js App Router

```typescript
// app/layout.tsx
import { MockProvider } from '@/lib/mock-provider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <MockProvider>
          {children}
        </MockProvider>
      </body>
    </html>
  );
}

// lib/mock-provider.tsx
'use client';

import { useEffect } from 'react';
import { handlers } from '@/mocks/handlers';

export function MockProvider({ children }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      import('@/mocks/browser').then(({ worker }) => {
        worker.start({
          onUnhandledRequest: 'bypass'
        });
      });
    }
  }, []);

  return <>{children}</>;
}
```

### Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    global: 'globalThis',
  },
  // MSW를 위한 설정
});

// src/main.tsx
if (import.meta.env.DEV) {
  import('./mocks/browser').then(({ worker }) => {
    worker.start();
  });
}
```

### Webpack

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    fallback: {
      // MSW를 위한 폴백 설정
      path: require.resolve('path-browserify'),
      util: require.resolve('util/'),
    },
  },
};
```

## 📊 타입 정의

주요 타입 인터페이스:

```typescript
interface Preset<T = any> {
  label: string;
  status: number;
  response: T | (() => T) | (() => Promise<T>);
}

interface MockingStatus {
  method: string;
  path: string;
  currentPreset: string | null;
}

interface ExtendedHandlers {
  handlers: RequestHandler[];
  useMock: (options: UseMockOptions) => void;
  useRealAPI: (options: UseRealAPIOptions) => void;
  createMockProfiles: (...profiles: Profile[]) => MockProfiles;
}

interface MockingState {
  getCurrentStatus: () => MockingStatus[];
  getCurrentProfile: () => string | null;
  subscribeToChanges: (callback: StateChangeCallback) => () => void;
  resetAll: () => void;
  resetEndpoint: (method: string, path: string) => void;
}
```

## 🤝 연관 패키지

- **[@msw-scenarios/react-devtools](../react-devtools)**: React GUI 개발 도구
- **[예제 프로젝트](../examples/nextjs-app-router)**: Next.js를 활용한 실제 사용 예제

## 📄 라이센스

MIT License - 자세한 내용은 [LICENSE](../../LICENSE) 파일을 참조하세요.

## 🤝 기여하기

버그 리포트나 기능 제안은 [GitHub Issues](https://github.com/manofbackend/msw-scenarios/issues)에 등록해 주세요.

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/manofbackend">hyunBell</a>
</div>
