import { HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { extendHandlers, http } from '..';
import { workerManager } from '../worker';

const server = setupServer();

describe('MSW Preset Handler Tests', () => {
  beforeAll(() => {
    workerManager.setupServer(server);
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    workerManager.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  describe('useMock', () => {
    it('should apply preset correctly', async () => {
      const userHandler = http
        .get('http://localhost/api/users', () => {
          return HttpResponse.json({ message: 'default 2' });
        })
        .presets(
          {
            label: 'empty',
            status: 200,
            response: { users: [] },
          },
          {
            label: 'withUsers',
            status: 200,
            response: { users: [{ id: 1, name: 'John' }] },
          }
        );

      const handlers = extendHandlers(userHandler);

      handlers.useMock({
        method: 'get',
        path: 'http://localhost/api/users',
        preset: 'empty',
      });

      const response = await fetch('http://localhost/api/users');
      const data = await response.json();
      expect(data).toEqual({ users: [] });
    });

    it('should handle override function', async () => {
      const userHandler = http
        .get('http://localhost/api/users', () => {
          return HttpResponse.json({ message: 'default 2' });
        })
        .presets({
          label: 'withUsers',
          status: 200,
          response: { users: [{ id: 1, name: 'John' }] },
        });

      const handlers = extendHandlers(userHandler);

      handlers.useMock({
        method: 'get',
        path: 'http://localhost/api/users',
        preset: 'withUsers',
        override: ({ data }) => {
          data.users.push({ id: 2, name: 'Jane' });
        },
      });

      const response = await fetch('http://localhost/api/users');
      const data = await response.json();
      expect(data.users).toHaveLength(2);
      expect(data.users[1]).toEqual({ id: 2, name: 'Jane' });
    });

    it('should throw error for non-existent preset', () => {
      const userHandler = http
        .get('http://localhost/api/users', () => {
          return HttpResponse.json({ message: 'default 2' });
        })
        .presets({
          label: 'empty',
          status: 200,
          response: { users: [] },
        });

      const handlers = extendHandlers(userHandler);

      expect(() =>
        handlers.useMock({
          method: 'get',
          path: 'http://localhost/api/users',
          // @ts-expect-error
          preset: 'nonexistent',
        })
      ).toThrow('Preset not found: nonexistent');
    });
  });

  describe('useRealAPI', () => {
    it('should reset to default handler', async () => {
      const userHandler = http
        .get('http://localhost/api/users', () => {
          return HttpResponse.json({ message: 'default response' });
        })
        .presets({
          label: 'empty',
          status: 200,
          response: { users: [] },
        });

      const handlers = extendHandlers(userHandler);

      handlers.useMock({
        method: 'get',
        path: 'http://localhost/api/users',
        preset: 'empty',
      });

      handlers.useRealAPI({
        method: 'get',
        path: 'http://localhost/api/users',
      });

      const response = await fetch('http://localhost/api/users');
      const data = await response.json();
      expect(data).toEqual({ message: 'default response' });
    });
  });

  describe('subscription', () => {
    it('should notify subscribers of preset changes', () => {
      const userHandler = http
        .get('http://localhost/api/users', () => {
          return HttpResponse.json({ message: 'default' });
        })
        .presets({
          label: 'empty',
          status: 200,
          response: { users: [] },
        });

      const handlers = extendHandlers(userHandler);
      const mockCallback = jest.fn();

      handlers.subscribeToChanges(mockCallback);

      handlers.useMock({
        method: 'get',
        path: 'http://localhost/api/users',
        preset: 'empty',
      });

      expect(mockCallback).toHaveBeenCalledWith({
        status: [
          {
            method: 'get',
            path: 'http://localhost/api/users',
            currentPreset: 'empty',
          },
        ],
        currentProfile: null,
      });
    });

    it('should handle unsubscribe correctly', () => {
      const userHandler = http
        .get('http://localhost/api/users', () => {
          return HttpResponse.json({ message: 'default' });
        })
        .presets({
          label: 'empty',
          status: 200,
          response: { users: [] },
        });

      const handlers = extendHandlers(userHandler);
      const mockCallback = jest.fn();

      const unsubscribe = handlers.subscribeToChanges(mockCallback);
      unsubscribe();

      handlers.useMock({
        method: 'get',
        path: 'http://localhost/api/users',
        preset: 'empty',
      });

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });
});
