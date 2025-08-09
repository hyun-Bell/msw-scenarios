'use client';

import { useState, useEffect } from 'react';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message: string;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export default function ApiTester() {
  const [endpoint, setEndpoint] = useState('/api/users');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const sendRequest = async () => {
    setLoading(true);
    setResponse('');
    setResponseTime(null);
    setStatusCode(null);

    const startTime = performance.now();

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (method !== 'GET' && method !== 'DELETE' && requestBody) {
        try {
          options.body = JSON.stringify(JSON.parse(requestBody));
        } catch {
          options.body = requestBody;
        }
      }

      const res = await fetch(endpoint, options);
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));
      setStatusCode(res.status);

      const contentType = res.headers.get('content-type');
      let responseData: any;

      if (contentType?.includes('application/json')) {
        responseData = await res.json();
        setResponse(JSON.stringify(responseData, null, 2));
      } else {
        responseData = await res.text();
        setResponse(responseData);
      }
    } catch (error) {
      setResponse(
        JSON.stringify(
          {
            error: 'Request Failed',
            message: error instanceof Error ? error.message : 'Unknown error',
          },
          null,
          2
        )
      );
      setStatusCode(0);
    } finally {
      setLoading(false);
    }
  };

  // 페이지 로드 후 자동으로 초기 요청 전송
  useEffect(() => {
    const timer = setTimeout(() => {
      sendRequest().then(() => {
        setInitialLoadDone(true);
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendRequest();
  };

  const getStatusColor = (status: number | null) => {
    if (!status) return 'text-gray-500';
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 300 && status < 400) return 'text-blue-600';
    if (status >= 400 && status < 500) return 'text-yellow-600';
    if (status >= 500) return 'text-red-600';
    return 'text-gray-600';
  };

  const getMethodColor = (m: HttpMethod) => {
    switch (m) {
      case 'GET':
        return 'bg-blue-100 text-blue-800';
      case 'POST':
        return 'bg-green-100 text-green-800';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'PATCH':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">API 테스터</h2>
      <p className="text-sm text-gray-600 mb-2">
        DevTools에서 프리셋을 설정한 후 여기서 API를 테스트해보세요.
      </p>
      <p className="text-xs text-blue-600 mb-4">
        ℹ️ 페이지 로드 시 자동으로 GET /api/users 요청이 전송되어 MSW 모킹이
        작동하는지 확인합니다.
        {!initialLoadDone && ' (초기화 중...)'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as HttpMethod)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>

          <input
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="API Endpoint (e.g., /api/users)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '요청 중...' : '전송'}
          </button>
        </div>

        {method !== 'GET' && method !== 'DELETE' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Request Body (JSON)
            </label>
            <textarea
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              placeholder='{"name": "홍길동", "email": "hong@example.com"}'
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              rows={4}
            />
          </div>
        )}
      </form>

      {(response || statusCode !== null) && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-4 text-sm">
            <span
              className={`px-2 py-1 rounded ${getMethodColor(method)} font-medium`}
            >
              {method}
            </span>
            <span className="text-gray-600">{endpoint}</span>
            {statusCode !== null && (
              <span className={`font-medium ${getStatusColor(statusCode)}`}>
                {statusCode === 0 ? 'Network Error' : `${statusCode}`}
              </span>
            )}
            {responseTime !== null && (
              <span className="text-gray-500">{responseTime}ms</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Response
            </label>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
              <pre className="text-sm font-mono whitespace-pre-wrap">
                {response}
              </pre>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          사용 가능한 엔드포인트
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            <span className="font-mono bg-blue-100 px-1 rounded">
              GET /api/users
            </span>{' '}
            - 사용자 목록 조회
          </li>
          <li>
            <span className="font-mono bg-blue-100 px-1 rounded">
              POST /api/users
            </span>{' '}
            - 새 사용자 생성
          </li>
        </ul>
      </div>
    </div>
  );
}
