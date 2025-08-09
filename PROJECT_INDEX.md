# MSW Scenarios - 프로젝트 인덱스

## 📋 프로젝트 개요

**msw-scenarios**는 MSW (Mock Service Worker) 2.x.x 기반의 타입 안전한 프리셋 관리 시스템입니다. MSW에 프리셋 시스템을 추가하여 완전한 TypeScript 통합과 함께 유연하고 타입 안전한 API 모킹을 제공합니다.

### 🎯 핵심 특징
- **타입 안전성**: 완전한 TypeScript 지원과 타입 추론
- **프리셋 시스템**: 다양한 응답 시나리오를 미리 정의
- **프로파일 관리**: 프리셋 그룹을 프로파일로 관리
- **실시간 상태**: React 친화적 상태 구독 패턴
- **개발자 도구**: React DevTools를 통한 GUI 인터페이스

---

## 🏗️ 모노레포 아키텍처

### 패키지 구조
```
packages/
├── core/                       # @msw-scenarios/core
│   ├── src/                    # 핵심 라이브러리 소스
│   ├── tests/                  # 단위/E2E 테스트
│   └── dist/                   # 빌드 산출물
├── react-devtools/            # @msw-scenarios/react-devtools
│   ├── src/                    # React DevTools 컴포넌트
│   └── demo/                   # 데모 앱
└── examples/
    └── nextjs-app-router/      # Next.js App Router 예제
```

### 📦 패키지 정보

#### @msw-scenarios/core (v0.3.0)
- **목적**: 핵심 모킹 라이브러리
- **의존성**: MSW ^2.6.0, immer ^10.1.1
- **타깃**: UMD & ES 모듈, Node >=18

#### @msw-scenarios/react-devtools (v0.3.0)
- **목적**: React 개발자 도구 GUI
- **의존성**: React >=16.8.0, Radix UI, Tailwind CSS
- **특징**: Storybook 통합, TypeScript 지원

---

## 🧩 핵심 컴포넌트

### 1. HTTP Handler Extension (`core/src/http.ts`)
MSW의 http 메서드를 확장하여 프리셋 기능 추가
```typescript
const handler = http.get('/api/user', defaultResolver)
  .presets(
    { label: 'success', status: 200, response: {...} },
    { label: 'error', status: 404, response: {...} }
  );
```

### 2. Extended Handlers (`core/src/extendHandlers.ts`)
핸들러 컬렉션 관리 및 프리셋 전환
```typescript
const handlers = extendHandlers(userHandler, postsHandler);
handlers.useMock({ method: 'get', path: '/api/user', preset: 'success' });
```

### 3. Mocking State (`core/src/mockingState.ts`)
Immer 기반 전역 상태 관리
- 현재 모킹 설정 추적
- 상태 변경 구독 패턴
- 불변성 보장

### 4. Worker Manager (`core/src/worker.ts`)
MSW 워커/서버 라이프사이클 관리
- 자동 워커 설정
- 핸들러 업데이트
- 환경별 최적화

### 5. Store System (`core/src/store/`)
Immer 기반 상태 관리
- `createStore.ts`: 스토어 팩토리
- `stores.ts`: 액션 정의

### 6. Type System (`core/src/types.ts`)
완전한 TypeScript 타입 정의
- 248라인의 포괄적 타입 시스템
- TypeScript 5 호환성
- 고급 타입 추론

---

## 🧪 테스트 전략

### Unit Tests (Jest)
- **위치**: `packages/core/tests/unit/`
- **실행**: `pnpm test`
- **커버리지**: 자동 수집
- **테스트 파일**:
  - `preset.test.ts`: 프리셋 기능
  - `profile.test.ts`: 프로파일 관리
  - `store.test.ts`: 상태 관리
  - `type-inference.test.ts`: 타입 추론
  - `worker.test.ts`: 워커 관리

### E2E Tests (Playwright)
- **위치**: `packages/core/tests/e2e/specs/`
- **실행**: `pnpm test:e2e`
- **브라우저**: Chrome, Firefox, Safari, Mobile
- **테스트 앱**: Next.js (`tests/e2e/test-app/`)
- **설정**:
  - 자동 재시도 (CI: 2회)
  - 실패 시 스크린샷/비디오
  - 다중 디바이스 지원

---

## ⚙️ 개발 워크플로우

### 명령어
```bash
# 설치
pnpm install

# 빌드 (모든 패키지)
pnpm build

# 개발 서버 (DevTools)
pnpm dev

# 테스트
pnpm test                # 모든 테스트
pnpm test:core          # Core 패키지만
pnpm test:e2e           # E2E 테스트
pnpm test:e2e:ui        # UI 모드

# 코드 품질
pnpm lint               # ESLint
pnpm lint:fix          # 자동 수정
pnpm format            # Prettier
pnpm format:check      # 포맷 확인

# 배포
pnpm changeset         # 변경사항 기록
pnpm version-packages  # 버전 업데이트
pnpm release          # 배포
```

### 기술 스택
- **빌드**: Vite + TypeScript
- **테스트**: Jest (Unit) + Playwright (E2E)
- **린팅**: ESLint + Prettier
- **패키지 관리**: pnpm workspaces
- **버전 관리**: Changesets
- **UI**: Tailwind CSS + Radix UI

---

## 🔧 설정 파일

### Core 패키지
- `jest.config.js`: Jest 단위 테스트 설정
- `playwright.config.ts`: E2E 테스트 설정 (다중 브라우저)
- `vite.config.ts`: Vite 빌드 설정 (UMD/ES)
- `tsconfig.json`: TypeScript 설정

### DevTools 패키지
- `vite.config.ts`: React DevTools 빌드
- `tailwind.config.js`: Tailwind CSS 설정
- `storybook/`: Storybook 설정

### 루트
- `pnpm-workspace.yaml`: 워크스페이스 설정
- `package.json`: 모노레포 스크립트

---

## 📚 문서 및 가이드

### 핵심 문서
- `README.md`: 프로젝트 소개 및 사용법
- `CLAUDE.md`: Claude Code 가이드라인
- `CONTRIBUTING.md`: 기여 가이드
- `CHANGELOG.md`: 변경사항 기록
- `ARCHITECTURE_ANALYSIS.md`: 아키텍처 분석

### 예제
- `packages/examples/nextjs-app-router/`: Next.js 13+ App Router 예제
- `packages/react-devtools/demo/`: DevTools 데모

---

## 🚀 주요 API

### Handler 생성
```typescript
import { http } from '@msw-scenarios/core';

const handler = http.get('/api/user', defaultResolver)
  .presets(
    { label: 'success', status: 200, response: user },
    { label: 'error', status: 404, response: { error: 'Not found' } }
  );
```

### 확장 핸들러 사용
```typescript
import { extendHandlers } from '@msw-scenarios/core';

const handlers = extendHandlers(userHandler, postsHandler);

// 특정 프리셋 사용
handlers.useMock({
  method: 'get',
  path: '/api/user',
  preset: 'success'
});

// 실제 API 사용
handlers.useRealAPI({
  method: 'get',
  path: '/api/user'
});
```

### 프로파일 관리
```typescript
const profiles = handlers.createMockProfiles(
  {
    name: 'Happy Path',
    actions: ({ useMock }) => {
      useMock({ method: 'get', path: '/api/user', preset: 'success' });
    }
  },
  {
    name: 'Error State',
    actions: ({ useMock }) => {
      useMock({ method: 'get', path: '/api/user', preset: 'error' });
    }
  }
);

profiles.useMock('Happy Path');
```

### Worker 설정
```typescript
import { workerManager } from '@msw-scenarios/core';

// 브라우저 환경
await workerManager.setupWorker();

// Node.js 환경
await workerManager.setupServer();
```

---

## 📊 프로젝트 메트릭스

### 코드베이스
- **Core 패키지**: ~1,500 LOC (TypeScript)
- **DevTools 패키지**: ~800 LOC (React + TypeScript)
- **테스트**: ~600 LOC (Jest + Playwright)
- **타입 정의**: 248라인 (고도로 최적화됨)

### 의존성
- **런타임**: MSW, immer
- **개발**: TypeScript, Vite, Jest, Playwright
- **UI**: React, Radix UI, Tailwind CSS

### 지원 환경
- **Node**: >=18
- **pnpm**: >=8
- **React**: >=16.8.0
- **MSW**: ^2.6.0

---

## 🔄 최근 업데이트 (v0.3.0)

### 주요 변경사항
- **모노레포 구조**: pnpm workspaces 기반으로 전환
- **React DevTools**: GUI 인터페이스 추가
- **TypeScript 5**: 최신 타입 시스템 적용
- **테스트 강화**: E2E 테스트 및 다중 브라우저 지원
- **프로파일 시스템**: 프리셋 그룹 관리 기능

### 향후 계획
- Storybook 통합 완성
- 추가 프레임워크 지원
- 성능 최적화
- 문서 확장

---

이 인덱스는 msw-scenarios 프로젝트의 전체 구조와 주요 구성 요소를 체계적으로 정리한 참고 자료입니다. 각 섹션의 파일 경로와 API는 실제 코드베이스와 일치하며, 개발자가 프로젝트를 이해하고 기여하는 데 필요한 모든 정보를 포함합니다.