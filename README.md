# MSW Scenarios Monorepo

<p align="center">
  <img src="https://github.com/user-attachments/assets/b67bbc6f-bb2b-46ec-8e4a-76652a777f04" alt="msw-scenarios Logo" width="400" style="border-radius: 15px;"/>
</p>

<div align="center">

[![npm version](https://badge.fury.io/js/@msw-scenarios%2Fcore.svg)](https://badge.fury.io/js/@msw-scenarios%2Fcore)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)

</div>

<div align="center">
  <a href="#packages">패키지</a> • 
  <a href="#key-features">특징</a> • 
  <a href="#quick-start">빠른 시작</a> • 
  <a href="#installation">설치</a> • 
  <a href="#development">개발 가이드</a>
</div>

<br />

**MSW Scenarios**는 [MSW (Mock Service Worker) 2.x.x](https://mswjs.io/)를 기반으로 한 **시나리오 기반 API 모킹 생태계**입니다. 이 모노레포는 **타입 안전한** 프리셋 관리 시스템과 **시각적 개발 도구**를 제공하여 개발과 테스트를 더욱 효율적으로 만들어줍니다.

## 📦 패키지 구성 {#packages}

이 모노레포는 3개의 핵심 패키지로 구성되어 있습니다:

### 🎯 [@msw-scenarios/core](./packages/core) [![npm](https://img.shields.io/npm/v/@msw-scenarios/core)](https://www.npmjs.com/package/@msw-scenarios/core)
**핵심 라이브러리** - MSW 2.x.x 기반의 타입 안전한 프리셋 관리 시스템
- 프리셋 기반 API 모킹
- 프로필 시스템으로 복합 시나리오 관리  
- 완전한 TypeScript 지원
- React/Node.js 환경 모두 지원

### 🎮 [@msw-scenarios/react-devtools](./packages/react-devtools) [![npm](https://img.shields.io/npm/v/@msw-scenarios/react-devtools)](https://www.npmjs.com/package/@msw-scenarios/react-devtools)
**React GUI 도구** - 시각적인 모킹 제어 인터페이스
- 실시간 프리셋 및 프로필 전환
- API 호출 모니터링 및 로깅
- 키보드 단축키 지원 (Ctrl+Shift+M)
- 라이트/다크 테마 지원

### 📚 [Next.js App Router 예제](./packages/examples/nextjs-app-router)
**완전한 사용 예제** - Next.js 15 App Router 기반 실제 구현
- 전체 시스템 통합 데모
- 다양한 사용 시나리오 제공
- 실제 개발 워크플로 시연

> 💡 **영감의 출처**: 이 라이브러리는 WOOWACON 2023 발표에서 영감을 받았습니다:  
> [프론트엔드 모킹 환경에 감칠맛 더하기](https://youtu.be/uiBCcmlJG4U?si=fZFCeQbxCCArA06a)

## ✨ 주요 특징 {#key-features}

- **🔒 완전한 타입 안전성**: TypeScript 최우선 설계로 컴파일 타임 안전성 보장
- **🔄 MSW 2.x.x 완벽 호환**: 최신 MSW와 원활한 통합
- **📋 프리셋 시스템**: 각 엔드포인트별 다양한 응답 시나리오 관리
- **👥 프로필 관리**: 여러 프리셋을 조합한 복합 시나리오 생성 및 전환
- **🎮 시각적 UI 통합**: React DevTools를 통한 직관적인 모킹 제어
- **🛠 개발자 친화적**: 간단하고 직관적인 API 설계
- **⚡ 모노레포 구조**: pnpm 워크스페이스 기반의 효율적인 개발 환경

## ⚡ 빠른 시작 {#quick-start}

가장 빠른 방법은 **Next.js 예제**를 실행해보는 것입니다:

```bash
# 저장소 클론
git clone https://github.com/manofbackend/msw-scenarios.git
cd msw-scenarios

# 의존성 설치
pnpm install

# 예제 프로젝트 실행
pnpm example:dev

# 브라우저에서 http://localhost:3000 열기
```

🎮 **즉시 체험하기**:
- 우측 하단의 DevTools 버튼 클릭 (또는 `Ctrl+Shift+M`)
- 다양한 API 응답 시나리오를 실시간으로 전환해보세요!

## 📦 설치 가이드 {#installation}

### 패키지별 설치

```bash
# 핵심 라이브러리만 사용
npm install @msw-scenarios/core msw

# React DevTools도 함께 사용
npm install @msw-scenarios/core @msw-scenarios/react-devtools msw

# pnpm 사용 (권장)
pnpm add @msw-scenarios/core @msw-scenarios/react-devtools msw

# yarn 사용
yarn add @msw-scenarios/core @msw-scenarios/react-devtools msw
```

### 요구사항

- **Node.js**: >=18
- **pnpm**: >=8 (모노레포 개발시)
- **MSW**: ^2.6.0
- **React**: >=16.8.0 (DevTools 사용시)

## 📚 기본 사용법

### 1. 핸들러 생성

```typescript
import { http } from '@msw-scenarios/core';
import { HttpResponse } from 'msw';

// 사용자 API 핸들러 + 프리셋 정의
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
        role: 'admin'
      }
    },
    {
      label: 'error',
      status: 404,
      response: { error: 'User not found' }
    }
  );
```

### 2. 브라우저/Node.js 설정

```typescript
import { extendHandlers, workerManager } from '@msw-scenarios/core';
import { setupWorker } from 'msw/browser'; // 브라우저용
// import { setupServer } from 'msw/node';  // Node.js용

// 핸들러 확장
const handlers = extendHandlers(userHandler);

// MSW 워커/서버 설정
const worker = setupWorker(...handlers.handlers); // 브라우저
// const server = setupServer(...handlers.handlers); // Node.js

// workerManager에 등록
workerManager.setupWorker(worker); // 브라우저
// workerManager.setupServer(server); // Node.js

// 시작
worker.start(); // 브라우저
```

### 3. React DevTools 추가 (선택사항)

```tsx
import { MswDevtools } from '@msw-scenarios/react-devtools';

function App() {
  return (
    <div>
      {/* 앱 컨텐츠 */}
      
      {/* 개발 환경에서만 DevTools 표시 */}
      {process.env.NODE_ENV === 'development' && (
        <MswDevtools 
          position="bottom-right"
          enableKeyboardShortcuts={true}
          theme="auto"
        />
      )}
    </div>
  );
}
```

### 4. 프리셋 및 프로필 사용

```typescript
// 개별 프리셋 사용
handlers.useMock({
  method: 'get',
  path: '/api/user',
  preset: 'success' // ✨ TypeScript 자동완성 지원
});

// 프로필 생성 (여러 프리셋 조합)
const profiles = handlers.createMockProfiles(
  {
    name: '성공 상태',
    actions: ({ useMock }) => {
      useMock({
        method: 'get',
        path: '/api/user',
        preset: 'success',
        override: ({ data }) => {
          data.name = 'Custom Name'; // 응답 수정
        },
      });
    },
  },
  {
    name: '오류 상태',
    actions: ({ useMock }) => {
      useMock({
        method: 'get',
        path: '/api/user',
        preset: 'error',
      });
    },
  }
);

// 프로필 적용
profiles.useMock('성공 상태');

// 실제 API로 전환
handlers.useRealAPI({
  method: 'get',
  path: '/api/user'
});
```

## 🛠️ 개발 가이드 {#development}

### 모노레포 개발 환경 설정

```bash
# 저장소 클론
git clone https://github.com/manofbackend/msw-scenarios.git
cd msw-scenarios

# pnpm 설치 (필수)
npm install -g pnpm

# 모든 패키지 의존성 설치
pnpm install

# 모든 패키지 빌드
pnpm build
```

### 개발 명령어

```bash
# 전체 개발 서버 시작
pnpm dev                    # React DevTools 개발 서버

# 패키지별 빌드
pnpm build                  # 모든 패키지 빌드
pnpm build:core            # Core 패키지만 빌드
pnpm build:devtools        # DevTools 패키지만 빌드

# 테스트 실행
pnpm test                  # 모든 테스트 실행
pnpm test:core             # Core 패키지 단위 테스트
pnpm test:e2e              # E2E 테스트 실행
pnpm test:e2e:ui           # Playwright UI 모드

# 예제 실행
pnpm example:dev           # Next.js 예제 개발 서버
pnpm example:build         # Next.js 예제 빌드
pnpm example:start         # Next.js 예제 프로덕션 실행

# 코드 품질
pnpm lint                  # 전체 린트 검사
pnpm lint:fix              # 린트 오류 자동 수정
pnpm format                # 코드 포매팅
pnpm format:check          # 포매팅 검사

# 릴리즈
pnpm changeset             # 변경사항 기록
pnpm version-packages      # 버전 업데이트
pnpm release              # 빌드 후 NPM 배포
```

## 🎯 고급 사용 예제

### 완전한 타입 안전성 예제

```typescript
import { http, extendHandlers } from '@msw-scenarios/core';
import { HttpResponse } from 'msw';

// 타입 정의
interface User {
  id: number;
  name: string;
  role: 'admin' | 'user';
}

// 타입 안전한 핸들러 생성
const userHandler = http
  .get('/api/user', (): HttpResponse => {
    return HttpResponse.json<User>({ id: 0, name: '', role: 'user' });
  })
  .presets(
    {
      label: 'admin',
      status: 200,
      response: { id: 1, name: 'Admin User', role: 'admin' as const }
    },
    {
      label: 'regular',
      status: 200, 
      response: { id: 2, name: 'Regular User', role: 'user' as const }
    }
  );

const handlers = extendHandlers(userHandler);

// ✨ 완전한 타입 안전성
handlers.useMock({
  method: 'get',        // ✅ 자동완성: 'get', 'post', 'put', 'delete'
  path: '/api/user',    // ✅ 자동완성: 정의된 경로만
  preset: 'admin',      // ✅ 자동완성: 해당 엔드포인트의 프리셋만
  override: ({ data }) => {
    data.name = 'Custom Admin';  // ✅ 타입 안전: User 타입
    // data.invalid = true;       // ❌ TypeScript 오류
  }
});
```

### Jest/테스트 통합

```typescript
import { setupServer } from 'msw/node';
import { http, extendHandlers, workerManager } from '@msw-scenarios/core';

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
    server.listen();
  });

  afterEach(() => workerManager.resetHandlers());
  afterAll(() => server.close());

  it('프리셋을 사용한 API 응답 테스트', async () => {
    handlers.useMock({ method: 'get', path: '/api/user', preset: 'success' });
    
    const response = await fetch('/api/user');
    expect(await response.json()).toEqual({ id: 1, name: 'John' });
  });
});
```

## 📚 패키지별 상세 문서

- **[@msw-scenarios/core](./packages/core/README.md)**: 핵심 API 레퍼런스
- **[@msw-scenarios/react-devtools](./packages/react-devtools/README.md)**: DevTools 사용 가이드  
- **[Next.js 예제](./packages/examples/nextjs-app-router/README.md)**: 완전한 구현 예제

## 🤝 기여하기

이 프로젝트에 기여해주셔서 감사합니다! 다음과 같은 방법으로 기여할 수 있습니다:

### 버그 리포트
- [GitHub Issues](https://github.com/manofbackend/msw-scenarios/issues)에서 버그를 신고해주세요
- 재현 가능한 예제와 함께 상세한 설명을 포함해주세요

### 기능 제안
- [GitHub Discussions](https://github.com/manofbackend/msw-scenarios/discussions)에서 새로운 아이디어를 공유해주세요
- 기능 요청은 구체적인 사용 사례와 함께 제출해주세요

### 코드 기여
1. 저장소를 포크하고 개발 환경을 설정하세요
2. 새로운 기능이나 버그 수정을 구현하세요
3. 테스트를 추가하고 기존 테스트가 통과하는지 확인하세요
4. Pull Request를 생성하세요

### 개발 가이드라인
- TypeScript 사용 필수
- 코드 변경시 테스트 추가
- Conventional Commits 메시지 형식 준수
- ESLint와 Prettier 규칙 따르기

## 📈 로드맵

- [ ] **Vue.js DevTools** - Vue 애플리케이션용 개발 도구
- [ ] **Storybook Addon** - Storybook 통합 애드온
- [ ] **GraphQL 지원** - GraphQL API 모킹 지원
- [ ] **성능 모니터링** - API 응답 시간 및 성능 메트릭
- [ ] **자동화 도구** - CLI 도구 및 설정 자동화

## 💬 커뮤니티

- **GitHub Discussions**: [질문 및 토론](https://github.com/manofbackend/msw-scenarios/discussions)
- **Issues**: [버그 신고 및 기능 요청](https://github.com/manofbackend/msw-scenarios/issues)
- **Twitter**: [@hyunBell](https://twitter.com/hyunBell)

## 📄 라이센스

MIT License - 자세한 내용은 [LICENSE](./LICENSE) 파일을 참조하세요.

---

<div align="center">
  <p>
    <strong>MSW Scenarios</strong>로 더 효율적인 API 모킹 경험을 시작하세요! 🚀
  </p>
  <p>
    Made with ❤️ by <a href="https://github.com/manofbackend">hyunBell</a>
  </p>
</div>
