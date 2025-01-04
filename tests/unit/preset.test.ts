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
        .get<
          { id: string },
          { name: string },
          { users: Array<{ id: number; name: string }> },
          'http://localhost/api/users'
        >('http://localhost/api/users', ({ params, request, cookies }) => {
          return HttpResponse.json({ users: [] });
        })
        .presets(
          {
            label: 'empty',
            status: 200,
            response: async ({ cookies, params }) => {
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

      const testHandler = http
        .get('http://localhost/api/test', () => {
          return HttpResponse.json({ message: 'default response' });
        })
        .presets({
          label: 'empty2',
          status: 200,
          response: { message: 'empty' },
        });

      const handlers = extendHandlers(userHandler, testHandler);

      handlers.useMock({
        method: 'get',
        path: 'http://localhost/api/users',
        preset: 'empty',
      });

      const response = await fetch('http://localhost/api/users');
      const data = await response.json();
      expect(data).toEqual({ users: [] });
    });

    it('should handle async preset response with params', async () => {
      const userHandler = http
        .get<
          { id: string },
          { name: string },
          { users: Array<{ id: number; name: string }> },
          'http://localhost/api/users/:id'
        >('http://localhost/api/users/:id', ({ params }) => {
          return HttpResponse.json({ users: [] });
        })
        .presets({
          label: 'userById',
          status: 200,
          response: async ({ params }) => {
            await delay(100); // Simulate async operation
            return {
              users: [{ id: parseInt(params.id), name: `User ${params.id}` }],
            };
          },
        });

      const handlers = extendHandlers(userHandler);

      handlers.useMock({
        method: 'get',
        path: 'http://localhost/api/users/:id',
        preset: 'userById',
      });

      const response = await fetch('http://localhost/api/users/123');
      const data = await response.json();

      expect(data.users).toHaveLength(1);
      expect(data.users[0]).toEqual({ id: 123, name: 'User 123' });
    });

    it('should handle sync preset response with params', async () => {
      const userHandler = http
        .get<
          { id: string },
          { name: string },
          { user: { id: number; name: string } },
          'http://localhost/api/users/:id'
        >('http://localhost/api/users/:id', ({ params }) => {
          return HttpResponse.json({ user: { id: 0, name: 'default' } });
        })
        .presets({
          label: 'userDetails',
          status: 200,
          response: ({ params }) => ({
            user: { id: parseInt(params.id), name: `User ${params.id}` },
          }),
        });

      const handlers = extendHandlers(userHandler);

      handlers.useMock({
        method: 'get',
        path: 'http://localhost/api/users/:id',
        preset: 'userDetails',
      });

      const response = await fetch('http://localhost/api/users/456');
      const data = await response.json();

      expect(data.user).toEqual({ id: 456, name: 'User 456' });
    });

    it('should handle preset response with cookies and params', async () => {
      const userHandler = http
        .get<
          { id: string },
          { name: string },
          { user: { id: number; name: string; role: string } },
          'http://localhost/api/users/:id'
        >('http://localhost/api/users/:id', ({ params, cookies }) => {
          return HttpResponse.json({
            user: { id: 0, name: 'default', role: 'user' },
          });
        })
        .presets({
          label: 'userWithRole',
          status: 200,
          response: ({ params, cookies }) => ({
            user: {
              id: parseInt(params.id),
              name: `User ${params.id}`,
              role: cookies.role || 'guest',
            },
          }),
        });

      const handlers = extendHandlers(userHandler);

      handlers.useMock({
        method: 'get',
        path: 'http://localhost/api/users/:id',
        preset: 'userWithRole',
      });

      // Test with cookie
      const responseWithCookie = await fetch('http://localhost/api/users/789', {
        headers: {
          Cookie: 'role=admin',
        },
      });
      const dataWithCookie = await responseWithCookie.json();

      expect(dataWithCookie.user).toEqual({
        id: 789,
        name: 'User 789',
        role: 'admin',
      });

      // Test without cookie
      const responseWithoutCookie = await fetch(
        'http://localhost/api/users/789'
      );
      const dataWithoutCookie = await responseWithoutCookie.json();

      expect(dataWithoutCookie.user).toEqual({
        id: 789,
        name: 'User 789',
        role: 'guest',
      });
    });

    it('should handle preset response with override and params', async () => {
      const userHandler = http
        .get<
          { id: string },
          { name: string },
          { user: { id: number; name: string } },
          'http://localhost/api/users/:id'
        >('http://localhost/api/users/:id', ({ params }) => {
          return HttpResponse.json({ user: { id: 0, name: 'default' } });
        })
        .presets({
          label: 'userDetails',
          status: 200,
          response: ({ params }) => ({
            user: { id: parseInt(params.id), name: `User ${params.id}` },
          }),
        });

      const handlers = extendHandlers(userHandler);

      handlers.useMock({
        method: 'get',
        path: 'http://localhost/api/users/:id',
        preset: 'userDetails',
        override: ({ data }) => {
          data.user.name = 'Overridden Name';
        },
      });

      const response = await fetch('http://localhost/api/users/101');
      const data = await response.json();

      expect(data.user).toEqual({ id: 101, name: 'Overridden Name' });
    });

    it('should handle preset response with multiple params', async () => {
      const commentHandler = http
        .get<
          { userId: string; postId: string },
          { name: string },
          {
            comment: {
              id: number;
              userId: number;
              postId: number;
              text: string;
            };
          },
          'http://localhost/api/users/:userId/posts/:postId/comment'
        >(
          'http://localhost/api/users/:userId/posts/:postId/comment',
          ({ params }) => {
            return HttpResponse.json({
              comment: { id: 0, userId: 0, postId: 0, text: 'default' },
            });
          }
        )
        .presets({
          label: 'userComment',
          status: 200,
          response: ({ params }) => ({
            comment: {
              id: 1,
              userId: parseInt(params.userId),
              postId: parseInt(params.postId),
              text: `Comment by user ${params.userId} on post ${params.postId}`,
            },
          }),
        });

      const handlers = extendHandlers(commentHandler);

      handlers.useMock({
        method: 'get',
        path: 'http://localhost/api/users/:userId/posts/:postId/comment',
        preset: 'userComment',
      });

      const response = await fetch(
        'http://localhost/api/users/123/posts/456/comment'
      );
      const data = await response.json();

      expect(data.comment).toEqual({
        id: 1,
        userId: 123,
        postId: 456,
        text: 'Comment by user 123 on post 456',
      });
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
