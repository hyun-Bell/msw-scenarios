import { HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { http, extendHandlers } from '..';

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
    const { handlers } = extendHandlers(
      http.get('http://localhost/test', () => {
        return new HttpResponse(JSON.stringify({ message: 'default' }), {
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );

    server.use(...handlers);

    const response = await fetch(`${BASE_URL}/test`);
    const data = await response.json();

    expect(data).toEqual({ message: 'default' });
  });

  it('should return preset response when preset is selected', async () => {
    const { handlers, useMock } = extendHandlers(
      http
        .get('http://localhost/test', () => {
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
        )
    );

    server.use(...handlers);

    useMock({
      method: 'GET',
      path: 'http://localhost/test',
      preset: 'Another Response',
    });

    const response = await fetch(`${BASE_URL}/test`);
    const data = await response.json();

    expect(data).toEqual({ message: 'another' });
  });

  it('should apply override function to preset response', async () => {
    const { handlers, useMock } = extendHandlers(
      http
        .get('http://localhost/test', () => {
          return new HttpResponse(JSON.stringify({ message: 'default' }), {
            headers: { 'Content-Type': 'application/json' },
          });
        })
        .presets({
          label: 'Custom Response',
          status: 200,
          response: { message: 'preset', count: 0 },
        })
    );

    server.use(...handlers);

    useMock({
      method: 'GET',
      path: 'http://localhost/test',
      preset: 'Custom Response',
      override: ({ data }) => {
        data.count = 42;
      },
    });

    const response = await fetch(`${BASE_URL}/test`);
    const data = await response.json();

    expect(data).toEqual({ message: 'preset', count: 42 });
  });
});
