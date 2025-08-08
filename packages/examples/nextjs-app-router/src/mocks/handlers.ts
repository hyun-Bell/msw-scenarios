import { http } from '@msw-scenarios/core';
import { extendHandlers } from '@msw-scenarios/core';
import type { User } from '@/app/api/users/route';

// API 응답 타입 정의
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message: string;
}

// 예제 사용자 데이터
const successUsers: User[] = [
  { id: 1, name: '김철수', email: 'kim@example.com', role: 'Admin', status: 'active' },
  { id: 2, name: '이영희', email: 'lee@example.com', role: 'User', status: 'active' },
  { id: 3, name: '박민수', email: 'park@example.com', role: 'User', status: 'inactive' },
];

const emptyUsers: User[] = [];

// 사용자 목록 조회 핸들러
const usersHandler = http
  .get('/api/users', () => {
    return Response.json({
      success: true,
      data: successUsers,
      message: '사용자 목록을 성공적으로 가져왔습니다.',
    } as ApiResponse<User[]>);
  })
  .presets(
    {
      label: 'success',
      status: 200,
      response: {
        success: true,
        data: successUsers,
        message: '사용자 목록을 성공적으로 가져왔습니다.',
      } as ApiResponse<User[]>,
    },
    {
      label: 'empty',
      status: 200,
      response: {
        success: true,
        data: emptyUsers,
        message: '등록된 사용자가 없습니다.',
      } as ApiResponse<User[]>,
    },
    {
      label: 'loading',
      status: 200,
      response: async () => {
        // 3초 로딩 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 3000));
        return {
          success: true,
          data: successUsers,
          message: '로딩 완료 - 사용자 목록을 가져왔습니다.',
        } as ApiResponse<User[]>;
      },
    },
    {
      label: 'server_error',
      status: 500,
      response: {
        success: false,
        error: 'Internal Server Error',
        message: '서버에서 오류가 발생했습니다.',
      } as ApiResponse,
    },
    {
      label: 'network_error',
      status: 503,
      response: {
        success: false,
        error: 'Service Unavailable',
        message: '서비스를 일시적으로 사용할 수 없습니다.',
      } as ApiResponse,
    },
    {
      label: 'unauthorized',
      status: 401,
      response: {
        success: false,
        error: 'Unauthorized',
        message: '인증이 필요합니다.',
      } as ApiResponse,
    }
  );

// 사용자 생성 핸들러
const createUserHandler = http
  .post('/api/users', () => {
    const newUser: User = {
      id: Date.now(),
      name: '새 사용자',
      email: 'new@example.com',
      role: 'User',
      status: 'active',
    };

    return Response.json({
      success: true,
      data: newUser,
      message: '사용자가 성공적으로 생성되었습니다.',
    } as ApiResponse<User>, { status: 201 });
  })
  .presets(
    {
      label: 'success',
      status: 201,
      response: {
        success: true,
        data: {
          id: Date.now(),
          name: '새 사용자',
          email: 'new@example.com',
          role: 'User',
          status: 'active',
        } as User,
        message: '사용자가 성공적으로 생성되었습니다.',
      } as ApiResponse<User>,
    },
    {
      label: 'validation_error',
      status: 400,
      response: {
        success: false,
        error: 'Bad Request',
        message: '필수 필드가 누락되었습니다.',
      } as ApiResponse,
    },
    {
      label: 'duplicate_error',
      status: 409,
      response: {
        success: false,
        error: 'Conflict',
        message: '이미 존재하는 이메일입니다.',
      } as ApiResponse,
    }
  );

// 핸들러 확장
export const handlers = extendHandlers(usersHandler, createUserHandler);

// 프로필 생성
export const profiles = handlers.createMockProfiles(
  {
    name: '정상 상태',
    actions: ({ useMock }) => {
      useMock({ method: 'get', path: '/api/users', preset: 'success' });
      useMock({ method: 'post', path: '/api/users', preset: 'success' });
    },
  },
  {
    name: '빈 상태',
    actions: ({ useMock }) => {
      useMock({ method: 'get', path: '/api/users', preset: 'empty' });
      useMock({ method: 'post', path: '/api/users', preset: 'success' });
    },
  },
  {
    name: '로딩 상태',
    actions: ({ useMock }) => {
      useMock({ method: 'get', path: '/api/users', preset: 'loading' });
      useMock({ method: 'post', path: '/api/users', preset: 'success' });
    },
  },
  {
    name: '오류 상태',
    actions: ({ useMock }) => {
      useMock({ method: 'get', path: '/api/users', preset: 'server_error' });
      useMock({ method: 'post', path: '/api/users', preset: 'validation_error' });
    },
  },
  {
    name: '권한 오류',
    actions: ({ useMock }) => {
      useMock({ method: 'get', path: '/api/users', preset: 'unauthorized' });
      useMock({ method: 'post', path: '/api/users', preset: 'validation_error' });
    },
  }
);