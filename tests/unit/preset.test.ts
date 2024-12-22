import { delay, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { extendHandlers, http, workerManager } from '../../src';

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

  describe('Default Behavior', () => {
    it('should respond with default preset initially', async () => {
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

      // Should automatically use default preset
      const response = await fetch('http://localhost/api/users');
      const data = await response.json();
      expect(data).toEqual({ message: 'default response' });
    });

    it('should show default preset in getCurrentStatus', () => {
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
      const status = handlers.getCurrentStatus();

      expect(status).toHaveLength(1);
      expect(status[0]).toEqual({
        method: 'get',
        path: 'http://localhost/api/users',
        currentPreset: 'default',
      });
    });
  });

  describe('useMock', () => {
    it('should apply preset correctly', async () => {
      const userHandler = http
        .get('http://localhost/api/users', () => {
          return HttpResponse.json({ message: 'default response' });
        })
        .presets(
          {
            label: 'empty',
            status: 200,
            response: async () => {
              await delay(1000);
              return { users: [] };
            },
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
          return HttpResponse.json({ message: 'default response' });
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
          return HttpResponse.json({ message: 'default response' });
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
    it('should remove handler when using real API', async () => {
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

      // Initial state - handler should be registered
      let registeredHandlers = server.listHandlers();
      expect(registeredHandlers).toHaveLength(1);

      handlers.useRealAPI({
        method: 'get',
        path: 'http://localhost/api/users',
      });

      // After useRealAPI - handler should be removed
      registeredHandlers = server.listHandlers();
      expect(registeredHandlers).toHaveLength(0);
    });

    it('should not show in getCurrentStatus after useRealAPI', () => {
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

      handlers.useRealAPI({
        method: 'get',
        path: 'http://localhost/api/users',
      });

      const status = handlers.getCurrentStatus();
      expect(status).toHaveLength(0);
    });
  });

  describe('Reset Behavior', () => {
    it('should reset to default preset', async () => {
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

      // First use a custom preset
      handlers.useMock({
        method: 'get',
        path: 'http://localhost/api/users',
        preset: 'empty',
      });

      // Then reset
      handlers.reset();

      // Should be back to default
      const response = await fetch('http://localhost/api/users');
      const data = await response.json();
      expect(data).toEqual({ message: 'default response' });
    });
  });

  describe('subscription', () => {
    it('should notify subscribers of preset changes', () => {
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
          return HttpResponse.json({ message: 'default response' });
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
