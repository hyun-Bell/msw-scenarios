# Contributing to msw-scenarios

msw-scenarios 프로젝트에 기여해 주셔서 감사합니다! 이 문서는 프로젝트에 기여하는 방법을 안내합니다.

## 🚀 시작하기

### 사전 요구사항

- Node.js >= 18
- pnpm >= 8
- Git

### 개발 환경 설정

1. **저장소 포크 및 클론**
   ```bash
   git clone https://github.com/YOUR_USERNAME/msw-scenarios.git
   cd msw-scenarios
   ```

2. **의존성 설치**
   ```bash
   pnpm install
   ```

3. **개발 브랜치 생성**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🛠 개발 워크플로

### 사용 가능한 명령어

```bash
# 전체 빌드
pnpm build

# 개별 패키지 빌드
pnpm build:core       # 코어 라이브러리
pnpm build:devtools   # React DevTools

# 개발 서버 (DevTools)
pnpm dev

# 린트
pnpm lint             # 모든 패키지
pnpm lint:fix         # 자동 수정

# 포맷
pnpm format           # 모든 파일 포맷팅
pnpm format:check     # 포맷 검사

# 테스트
pnpm test             # 모든 패키지 테스트
pnpm test:core        # 코어 라이브러리만
pnpm test:e2e         # E2E 테스트
pnpm test:e2e:ui      # E2E 테스트 (UI 모드)

# 변경사항 추가
pnpm changeset
```

### 코드 스타일

- **TypeScript**: 엄격한 타입 체크 활성화
- **ESLint + Prettier**: 자동 포매팅 및 린팅
- **세미콜론**: 필수
- **따옴표**: 단일 따옴표 사용
- **명시적 `any` 금지**: 타입 안전성 보장

## 📝 변경사항 문서화

이 프로젝트는 [Changesets](https://github.com/changesets/changesets)를 사용하여 버전 관리를 합니다.

### Changeset 생성

변경사항을 완료한 후:

```bash
pnpm changeset
```

1. 변경 유형 선택:
   - **patch**: 버그 수정
   - **minor**: 새로운 기능 추가 (하위 호환)
   - **major**: 파괴적 변경사항

2. 변경사항 요약 작성

### Changeset 가이드라인

**좋은 예:**
```
feat: Add preset switching API

This adds the ability to switch between different response presets 
at runtime using the useMock method.
```

**나쁜 예:**
```
fix stuff
```

## 🧪 테스트

### 단위 테스트

- **위치**: `tests/unit/`
- **도구**: Jest
- **커버리지**: 새로운 기능은 테스트 필수

```bash
# 특정 테스트 파일 실행
pnpm test:core preset.test.ts

# 감시 모드
pnpm test:core --watch

# 특정 패키지에서 테스트 실행
pnpm --filter @msw-scenarios/core test
```

### E2E 테스트

- **위치**: `tests/e2e/specs/`
- **도구**: Playwright
- **테스트 앱**: Next.js 앱 (`tests/e2e/test-app/`)

```bash
# E2E 테스트 실행
pnpm test:e2e

# UI 모드로 실행
pnpm test:e2e:ui

# 테스트 앱 수동 실행
pnpm test:e2e:dev
```

### 테스트 작성 가이드라인

1. **단위 테스트**: 각 함수/클래스의 동작 검증
2. **통합 테스트**: 컴포넌트 간 상호작용 검증
3. **E2E 테스트**: 실제 사용자 시나리오 검증

## 🔄 Pull Request 프로세스

### PR 생성 전 체크리스트

- [ ] 테스트가 통과하는지 확인
- [ ] 린트 오류가 없는지 확인
- [ ] Changeset이 추가되었는지 확인
- [ ] 문서가 업데이트되었는지 확인 (해당되는 경우)

### PR 제출

1. **명확한 제목 작성**
   ```
   feat: Add profile management API
   fix: Resolve preset switching bug
   docs: Update API documentation
   ```

2. **상세한 설명 작성**
   - 변경사항 요약
   - 변경 이유
   - 테스트 방법
   - 관련 이슈 링크

3. **PR 템플릿 사용**
   - 자동으로 생성되는 템플릿 활용
   - 모든 섹션 작성

### 코드 리뷰

- 모든 PR은 리뷰를 거칩니다
- 피드백에 대해 건설적으로 응답해 주세요
- 필요시 추가 변경사항을 커밋해 주세요

## 🐛 이슈 리포팅

### 버그 리포트

다음 정보를 포함해 주세요:

- **환경**: Node.js 버전, 브라우저, OS
- **재현 단계**: 상세한 재현 방법
- **예상 동작**: 기대했던 결과
- **실제 동작**: 실제 발생한 결과
- **추가 정보**: 관련 코드, 스크린샷 등

### 기능 요청

- **사용 사례**: 왜 이 기능이 필요한지
- **제안된 해결책**: 어떻게 구현되어야 하는지
- **대안**: 다른 가능한 접근법들

## 🏗 프로젝트 구조

이 프로젝트는 **모노레포** 구조를 사용합니다:

```
packages/
├── core/                      # @msw-scenarios/core
│   ├── src/
│   │   ├── http.ts           # HTTP 메소드 핸들러 (프리셋 지원)
│   │   ├── extendHandlers.ts # 핸들러 확장 및 프로필 관리
│   │   ├── mockingState.ts   # 전역 모킹 상태 관리
│   │   ├── worker.ts         # MSW 워커/서버 관리
│   │   ├── types.ts          # TypeScript 타입 정의
│   │   └── store/            # 상태 관리 구현
│   └── tests/                # 테스트 파일들
└── react-devtools/           # @msw-scenarios/react-devtools
    ├── src/                  # React DevTools 컴포넌트
    └── tests/                # DevTools 테스트
```

### 패키지별 역할

- **@msw-scenarios/core**: MSW 기반 시나리오 모킹 라이브러리
- **@msw-scenarios/react-devtools**: React 개발 도구 (브라우저 확장)

### 모노레포 개발 가이드

#### 특정 패키지에서만 작업하기
```bash
# core 패키지에서 개발
cd packages/core

# 또는 필터를 사용하여 특정 패키지 명령 실행
pnpm --filter @msw-scenarios/core test
pnpm --filter @msw-scenarios/react-devtools dev
```

#### 패키지 간 의존성
- DevTools는 core 패키지에 의존합니다
- 변경사항은 패키지별로 독립적으로 changeset을 생성할 수 있습니다

#### 새 패키지 추가 시
1. `packages/` 디렉토리에 새 폴더 생성
2. `package.json`에 적절한 이름 설정 (`@msw-scenarios/새패키지명`)
3. 루트의 `pnpm-workspace.yaml`은 자동으로 인식됩니다

### 핵심 개념

- **Preset System**: 각 핸들러가 여러 응답 시나리오를 가질 수 있음
- **Profile Management**: 프리셋 구성의 그룹화 및 전환
- **Type Safety**: 경로, 메소드, 응답 타입의 완전한 TypeScript 지원
- **State Subscription**: React 친화적인 상태 관리

## 🤝 커뮤니티 가이드라인

### 행동 강령

- 서로를 존중하고 배려합니다
- 건설적인 피드백을 제공합니다
- 다양한 관점과 경험을 환영합니다
- 학습과 성장에 열려있습니다

### 커뮤니케이션

- **이슈**: 버그 리포트, 기능 요청
- **Discussions**: 아이디어 논의, 질문
- **PR**: 코드 변경사항

## 📚 추가 리소스

- [MSW 문서](https://mswjs.io/)
- [Changesets 가이드](https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [Jest 문서](https://jestjs.io/)
- [Playwright 문서](https://playwright.dev/)

## 🙋‍♀️ 질문이 있으신가요?

- GitHub Issues에서 질문을 남겨주세요
- 기존 이슈들을 먼저 확인해 보세요
- 명확하고 구체적인 질문을 작성해 주세요

감사합니다! 🎉