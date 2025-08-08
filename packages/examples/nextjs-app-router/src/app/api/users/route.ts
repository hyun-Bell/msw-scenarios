import { NextResponse } from 'next/server';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

// 실제 API 응답 (Mock이 비활성화된 경우)
const mockUsers: User[] = [
  {
    id: 1,
    name: '김철수',
    email: 'kim@example.com',
    role: 'Admin',
    status: 'active',
  },
  {
    id: 2,
    name: '이영희',
    email: 'lee@example.com',
    role: 'User',
    status: 'active',
  },
  {
    id: 3,
    name: '박민수',
    email: 'park@example.com',
    role: 'User',
    status: 'inactive',
  },
];

export async function GET() {
  try {
    // 실제 환경에서는 데이터베이스나 외부 API에서 데이터를 가져옴
    await new Promise((resolve) => setTimeout(resolve, 500)); // 로딩 시뮬레이션

    return NextResponse.json({
      success: true,
      data: mockUsers,
      message: '사용자 목록을 성공적으로 가져왔습니다.',
    });
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: '사용자 목록을 가져오는 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role } = body;

    // 유효성 검사
    if (!name || !email || !role) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: '필수 필드가 누락되었습니다.',
        },
        { status: 400 }
      );
    }

    // 새 사용자 생성 (실제로는 데이터베이스에 저장)
    const newUser: User = {
      id: Date.now(), // 실제로는 auto-increment ID 사용
      name,
      email,
      role,
      status: 'active',
    };

    await new Promise((resolve) => setTimeout(resolve, 300)); // 저장 시뮬레이션

    return NextResponse.json(
      {
        success: true,
        data: newUser,
        message: '사용자가 성공적으로 생성되었습니다.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/users error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: '사용자 생성 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
