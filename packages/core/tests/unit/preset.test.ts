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

  describe('Basic Handler Functionality', () => {
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
      const response = await fetch('http://localhost/api/users');
      const data = await response.json();

      expect(data).toEqual({ message: 'default response' });

      const status = handlers.getCurrentStatus();
      expect(status).toHaveLength(1);
      expect(status[0]).toEqual({
        method: 'get',
        path: 'http://localhost/api/users',
        currentPreset: 'default',
      });
    });

    it('should handle async preset with params and override', async () => {
      const userHandler = http
        .get('http://localhost/api/users/:id', () => {
          return HttpResponse.json({ user: { id: 0, name: 'default' } });
        })
        .presets({
          label: 'userDetails',
          status: 200,
          response: async ({ params }) => {
            await delay(100);
            const id =
              typeof params.id === 'string' ? params.id : params.id?.[0] || '0';
            return {
              user: { id: parseInt(id), name: `User ${id}` as string }, // Use string type for flexibility
            };
          },
        });

      const handlers = extendHandlers(userHandler);

      handlers.useMock({
        method: 'get',
        path: 'http://localhost/api/users/:id',
        preset: 'userDetails',
        override: ({ data }) => {
          // In immer draft, properties become mutable
          data.user.name = 'Overridden Name';
        },
      });

      const response = await fetch('http://localhost/api/users/123');
      const data = await response.json();

      expect(data.user).toEqual({ id: 123, name: 'Overridden Name' });
    });

    it('should handle multiple handlers registration', async () => {
      const userHandler = http
        .get('http://localhost/api/users', () => {
          return HttpResponse.json({ type: 'users' });
        })
        .presets({
          label: 'empty',
          status: 200,
          response: { users: [] },
        });

      const postHandler = http
        .get('http://localhost/api/posts', () => {
          return HttpResponse.json({ type: 'posts' });
        })
        .presets({
          label: 'withPosts',
          status: 200,
          response: { posts: [{ id: 1 }] },
        });

      const handlers = extendHandlers(userHandler, postHandler);

      // Set mocks for both handlers
      handlers.useMock({
        method: 'get',
        path: 'http://localhost/api/users',
        preset: 'empty',
      });

      handlers.useMock({
        method: 'get',
        path: 'http://localhost/api/posts',
        preset: 'withPosts',
      });

      // Verify both handlers are registered and working
      let response = await fetch('http://localhost/api/users');
      let data = await response.json();
      expect(data).toEqual({ users: [] });

      response = await fetch('http://localhost/api/posts');
      data = await response.json();
      expect(data).toEqual({ posts: [{ id: 1 }] });

      // Verify status reflects both handlers
      const status = handlers.getCurrentStatus();
      expect(status).toHaveLength(2);
      expect(status).toEqual(
        expect.arrayContaining([
          {
            method: 'get',
            path: 'http://localhost/api/users',
            currentPreset: 'empty',
          },
          {
            method: 'get',
            path: 'http://localhost/api/posts',
            currentPreset: 'withPosts',
          },
        ])
      );
    });
  });

  describe('Real API Integration', () => {
    it('should handle switching between mock and real API', async () => {
      const userHandler = http
        .get('http://localhost/api/users', () => {
          return HttpResponse.json({ message: 'default response' });
        })
        .presets({
          label: 'mock',
          status: 200,
          response: { users: [{ id: 1 }] },
        });

      const handlers = extendHandlers(userHandler);

      // Use mock
      handlers.useMock({
        method: 'get',
        path: 'http://localhost/api/users',
        preset: 'mock',
      });

      let response = await fetch('http://localhost/api/users');
      let data = await response.json();
      expect(data).toEqual({ users: [{ id: 1 }] });

      // Switch to real API
      handlers.useRealAPI({
        method: 'get',
        path: 'http://localhost/api/users',
      });

      const status = handlers.getCurrentStatus();
      expect(status).toHaveLength(0);
    });
  });

  describe('State Management', () => {
    it('should handle state changes and notifications', () => {
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

      unsubscribe();
      handlers.reset();

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should throw error for non-existent preset', () => {
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

      expect(() =>
        handlers.useMock({
          method: 'get',
          path: 'http://localhost/api/users',
          preset: 'nonexistent' as any,
        })
      ).toThrow('Preset not found: nonexistent');
    });
  });
});
