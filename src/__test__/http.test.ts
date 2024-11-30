import { HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { http, extendHandlers } from '..';

const server = setupServer();
const BASE_URL = 'http://localhost';

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
          response: { message: 'preset', count: 0 },
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
        },
      });

      const { data } = await setupTest(fullPath);
      expect(data).toEqual({ message: 'preset', count: 42 });
    });
  });

  describe('Real API', () => {
    it('should return default response when useRealAPI is called', async () => {
      const fullPath = `${BASE_URL}/test`;
      const handlers = [
        createTestHandler(fullPath).presets({
          label: 'mock',
          status: 200,
          response: { message: 'mocked' },
        }),
      ];

      const extended = extendHandlers(...handlers);

      server.use(...handlers);

      extended.useMock({
        method: 'get',
        path: fullPath,
        preset: 'mock',
      });

      extended.useRealAPI({
        method: 'get',
        path: fullPath,
      });

      const { data } = await setupTest(fullPath);
      expect(data).toEqual({ message: 'default' });
    });
  });

  describe('Mock Profiles', () => {
    it('should apply mock profile correctly', async () => {
      const fullPath = `${BASE_URL}/test`;
      const handlers = [
        createTestHandler(fullPath).presets(
          {
            label: 'success',
            status: 200,
            response: { message: 'success' },
          },
          {
            label: 'error',
            status: 404,
            response: { message: 'error' },
          }
        ),
      ];

      const extended = extendHandlers(...handlers);

      server.use(...handlers);

      const profiles = extended.createMockProfiles(
        {
          name: 'Success Profile',
          actions: ({ useMock }) => {
            useMock({
              method: 'get',
              path: fullPath,
              preset: 'success',
            });
          },
        },
        {
          name: 'Error Profile',
          actions: ({ useMock }) => {
            useMock({
              method: 'get',
              path: fullPath,
              preset: 'error',
            });
          },
        }
      );

      profiles.useMock('Success Profile');
      const successResponse = await setupTest(fullPath);
      expect(successResponse.data).toEqual({ message: 'success' });

      profiles.useMock('Error Profile');
      const errorResponse = await setupTest(fullPath);
      expect(errorResponse.data).toEqual({ message: 'error' });
    });

    it('should handle mixed mock and real API in profile', async () => {
      const testPath = `${BASE_URL}/test`;
      const otherPath = `${BASE_URL}/other`;

      const handlers = [
        createTestHandler(testPath).presets({
          label: 'mock',
          status: 200,
          response: { message: 'mocked' },
        }),
        createTestHandler(otherPath).presets({
          label: 'mock',
          status: 200,
          response: { message: 'mocked' },
        }),
      ];

      const extended = extendHandlers(...handlers);

      server.use(...handlers);

      const profiles = extended.createMockProfiles({
        name: 'Mixed Profile',
        actions: ({ useMock, useRealAPI }) => {
          useMock({
            method: 'get',
            path: testPath,
            preset: 'mock',
          });
          useRealAPI({
            method: 'get',
            path: otherPath,
          });
        },
      });

      profiles.useMock('Mixed Profile');

      const testResponse = await setupTest(testPath);
      expect(testResponse.data).toEqual({ message: 'mocked' });

      const otherResponse = await setupTest(otherPath);
      expect(otherResponse.data).toEqual({ message: 'default' });
    });
  });
});
