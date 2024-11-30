import { HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { http, extendHandlers } from '..';

const server = setupServer();
const BASE_URL = 'http://localhost';

interface TestResponse {
  message: string;
  count?: number;
}

describe('MSW Preset Extension', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  const createTestHandler = <P extends string>(path: P) => {
    return http.get(path, () => {
      return new HttpResponse(JSON.stringify({ message: 'default' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    });
  };

  const setupTest = async (path: string) => {
    const response = await fetch(path);
    const data = await response.json();
    return { response, data };
  };

  describe('Default Response', () => {
    it('should return default response when no preset is selected', async () => {
      const fullPath = `${BASE_URL}/test`;
      const { handlers } = extendHandlers(createTestHandler(fullPath));

      server.use(...handlers);

      const { data } = await setupTest(fullPath);
      expect(data).toEqual({ message: 'default' });
    });
  });

  describe('Preset Response', () => {
    it('should return preset response when preset is selected', async () => {
      const fullPath = `${BASE_URL}/test`;
      const handlers = [
        createTestHandler(fullPath).presets(
          {
            label: 'preset1',
            status: 200,
            response: { message: 'preset' },
          },
          {
            label: 'preset2',
            status: 200,
            response: { message: 'another' },
          }
        ),
      ];

      const extended = extendHandlers(...handlers);

      server.use(...handlers);

      extended.useMock({
        method: 'get',
        path: fullPath,
        preset: 'preset2',
      });

      const { data } = await setupTest(fullPath);
      expect(data).toEqual({ message: 'another' });
    });

    it('should apply override function to preset response', async () => {
      const fullPath = `${BASE_URL}/test`;
      const handlers = [
        createTestHandler(fullPath).presets({
          label: 'withCount',
          status: 200,
          response: { message: 'preset', count: 0, a: 5 },
        }),
      ];

      const extended = extendHandlers(...handlers);

      server.use(...handlers);

      extended.useMock({
        method: 'get',
        path: fullPath,
        preset: 'withCount',
        override: ({ data }) => {
          data.count = 42;
          data.a = 10;
        },
      });

      const { data } = await setupTest(fullPath);
      expect(data).toEqual({ message: 'preset', count: 42 });
    });
  });
});
