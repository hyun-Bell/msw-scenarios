import { HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { http, selectPreset } from '..';

const server = setupServer();
const BASE_URL = 'http://localhost';

describe('MSW Preset Extension', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' }); // 처리되지 않은 요청에 대해 에러를 발생시킴
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it('should return default response when no preset is selected', async () => {
    const handler = http.get('http://localhost/test', () => {
      // 전체 URL 패턴 사용
      return new HttpResponse(JSON.stringify({ message: 'default' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    });

    server.use(handler);

    const response = await fetch(`${BASE_URL}/test`);
    const data = await response.json();

    expect(data).toEqual({ message: 'default' });
  });

  it('should return preset response when preset is selected', async () => {
    const handler = http
      .get('http://localhost/test', () => {
        // 전체 URL 패턴 사용
        return new HttpResponse(JSON.stringify({ message: 'default' }), {
          headers: { 'Content-Type': 'application/json' },
        });
      })
      .presets(
        {
          label: 'Custom Response',
          status: 200,
          response: { message: 'preset' },
        },
        {
          label: 'Another Response',
          status: 200,
          response: { message: 'another' },
        }
      );

    server.use(handler);
    selectPreset('http://localhost/test', null); // 전체 URL 패턴으로 프리셋 선택
    selectPreset('http://localhost/test', 1); // 전체 URL 패턴으로 프리셋 선택

    const response = await fetch(`${BASE_URL}/test`);
    const data = await response.json();

    expect(data).toEqual({ message: 'preset' });
  });
});
