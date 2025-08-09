# Next.js App Router Example - MSW Scenarios

Next.js 15 App Router와 MSW Scenarios, React DevTools를 사용한 완전한 예제 프로젝트입니다.

## 🎯 프로젝트 개요

이 예제는 실제 개발 환경에서 MSW Scenarios를 어떻게 활용하는지 보여줍니다:

- **Next.js 15 App Router** 구조 사용
- **MSW Scenarios** 프리셋 시스템으로 다양한 API 응답 시나리오 관리
- **React DevTools** GUI로 시각적인 모킹 제어
- **TypeScript** 완전 지원으로 타입 안전성 보장

## 🚀 빠른 시작

### 전제 조건

- Node.js 18 이상
- pnpm 8 이상

### 설치 및 실행

```bash
# 루트 디렉토리에서 의존성 설치
pnpm install

# Example 프로젝트 실행
pnpm example:dev

# 브라우저에서 http://localhost:3000 열기
```

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/users/         # API Routes (실제 백엔드)
│   ├── layout.tsx         # Root Layout + DevTools
│   ├── page.tsx           # 메인 페이지
│   └── globals.css        # 스타일
├── components/            # React 컴포넌트
│   ├── UserList.tsx       # 사용자 목록 표시
│   ├── MockingControls.tsx # 개별 프리셋 제어
│   └── ProfileSwitcher.tsx # 프로필 기반 시나리오
├── mocks/                 # MSW 설정
│   ├── handlers.ts        # API 핸들러 및 프리셋
│   ├── browser.ts         # 브라우저용 MSW 설정
│   └── server.ts          # Node.js용 MSW 설정
└── lib/
    └── mock-setup.tsx     # MSW 초기화 컴포넌트
```

## 🎮 주요 기능

### 1. 프리셋 시스템

각 API 엔드포인트에 대해 다양한 응답 시나리오를 정의:

```typescript
const usersHandler = http
  .get('/api/users', defaultResolver)
  .presets(
    { label: 'success', status: 200, response: successData },
    { label: 'empty', status: 200, response: [] },
    { label: 'loading', status: 200, response: async () => { ... } },
    { label: 'server_error', status: 500, response: errorResponse }
  );
```

### 2. 프로필 시스템

여러 프리셋을 조합한 완전한 시나리오:

```typescript
export const profiles = handlers.createMockProfiles(
  {
    name: '정상 상태',
    actions: ({ useMock }) => {
      useMock({ method: 'get', path: '/api/users', preset: 'success' });
      useMock({ method: 'post', path: '/api/users', preset: 'success' });
    },
  }
  // ... 더 많은 프로필
);
```

### 3. 시각적 DevTools

개발 환경에서 우측 하단에 표시되는 GUI:

- 실시간 모킹 상태 확인
- 프리셋 및 프로필 전환
- API 로그 모니터링

## 🛠️ 사용 가능한 시나리오

### 개별 프리셋

| 프리셋          | 설명                 | HTTP 상태 |
| --------------- | -------------------- | --------- |
| `success`       | 정상적인 사용자 목록 | 200       |
| `empty`         | 빈 사용자 목록       | 200       |
| `loading`       | 3초 지연된 응답      | 200       |
| `server_error`  | 서버 내부 오류       | 500       |
| `network_error` | 네트워크 오류        | 503       |
| `unauthorized`  | 인증 오류            | 401       |
| `real-api`      | 실제 API 호출        | -         |

### 프로필 시나리오

- **정상 상태**: 모든 API가 정상 동작
- **빈 상태**: 초기 데이터 없는 상태
- **로딩 상태**: 네트워크 지연 시뮬레이션
- **오류 상태**: 서버 오류 시나리오
- **권한 오류**: 인증 실패 시나리오

## 💻 코드 예제

### 컴포넌트에서 프리셋 사용

```typescript
// 개별 프리셋 제어
handlers.useMock({
  method: 'get',
  path: '/api/users',
  preset: 'loading',
});

// 프로필 적용
profiles.useMock('오류 상태');

// 실제 API로 전환
handlers.useRealAPI({
  method: 'get',
  path: '/api/users',
});
```

### 커스텀 프리셋 추가

```typescript
const customHandler = http.get('/api/custom', defaultResolver).presets({
  label: 'custom_scenario',
  status: 200,
  response: { custom: 'data' },
});
```

## 🧪 테스트 시나리오

### UI 상태 테스트

1. **로딩 상태**: "로딩 상태" 프로필 선택 → 스피너 확인
2. **빈 상태**: "빈 상태" 프로필 선택 → 빈 화면 메시지 확인
3. **오류 상태**: "오류 상태" 프로필 선택 → 에러 메시지 확인

### 성능 테스트

1. **네트워크 지연**: "로딩" 프리셋으로 느린 네트워크 시뮬레이션
2. **실제 API**: "실제 API" 프리셋으로 실제 응답 시간 측정

## 🔧 설정 변경

### 환경 변수

```env
NODE_ENV=development    # DevTools 활성화
```

### MSW 설정 커스터마이징

`src/mocks/browser.ts`에서 MSW 동작 설정:

```typescript
worker.start({
  onUnhandledRequest: 'bypass', // 처리되지 않은 요청 허용
  quiet: false, // 콘솔 로그 표시
});
```

## 🎨 UI 커스터마이징

### 테마 변경

`src/app/globals.css`에서 CSS 커스텀 속성 수정:

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96%;
  /* ... */
}
```

### DevTools 위치 변경

`src/app/layout.tsx`에서 DevTools 위치 조정:

```tsx
{
  process.env.NODE_ENV === 'development' && (
    <MswDevtools position="top-right" />
  );
}
```

## 📚 참고 자료

- [MSW Scenarios 문서](../../core/README.md)
- [React DevTools 문서](../../react-devtools/README.md)
- [Next.js App Router 가이드](https://nextjs.org/docs/app)
- [MSW 공식 문서](https://mswjs.io/)

## 🤝 기여하기

버그 리포트나 기능 제안은 [GitHub Issues](https://github.com/manofbackend/msw-scenarios/issues)에 등록해 주세요.

## 📄 라이센스

MIT License - 자세한 내용은 [LICENSE](../../../LICENSE) 파일을 참조하세요.
