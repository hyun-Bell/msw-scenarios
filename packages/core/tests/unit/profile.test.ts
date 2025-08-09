import { HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { extendHandlers, http, workerManager } from '../../src';

const server = setupServer();

describe('MSW Profile Tests', () => {
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

  it('should apply profile correctly', async () => {
    const userHandler = http
      .get('http://localhost/api/users', () => {
        return HttpResponse.json({ message: 'default response' });
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

    // Verify default response first
    let response = await fetch('http://localhost/api/users');
    let data = await response.json();
    expect(data).toEqual({ message: 'default response' });

    const profiles = handlers.createMockProfiles(
      {
        name: 'Empty State',
        actions: ({ useMock }) => {
          useMock({
            method: 'get',
            path: 'http://localhost/api/users',
            preset: 'empty',
          });
        },
      },
      {
        name: 'With Data',
        actions: ({ useMock }) => {
          useMock({
            method: 'get',
            path: 'http://localhost/api/users',
            preset: 'withUsers',
          });
        },
      }
    );

    // Apply Empty State profile
    profiles.useMock('Empty State');
    response = await fetch('http://localhost/api/users');
    data = await response.json();
    expect(data).toEqual({ users: [] });

    // Switch to With Data profile
    profiles.useMock('With Data');
    response = await fetch('http://localhost/api/users');
    data = await response.json();
    expect(data.users).toHaveLength(1);
    expect(data.users[0].name).toBe('John');
  });

  it('should handle profile reset correctly', async () => {
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
    const profiles = handlers.createMockProfiles({
      name: 'Empty State',
      actions: ({ useMock }) => {
        useMock({
          method: 'get',
          path: 'http://localhost/api/users',
          preset: 'empty',
        });
      },
    });

    profiles.useMock('Empty State');
    profiles.reset();

    const response = await fetch('http://localhost/api/users');
    const data = await response.json();
    expect(data).toEqual({ message: 'default response' });
  });

  it('should handle mixed mock and real API in profile', async () => {
    const userHandler = http
      .get('http://localhost/api/users', () => {
        return HttpResponse.json({ message: 'default response' });
      })
      .presets({
        label: 'empty',
        status: 200,
        response: { users: [] },
      });

    const postHandler = http
      .get('http://localhost/api/posts', () => {
        return HttpResponse.json({ message: 'default posts' });
      })
      .presets({
        label: 'withPosts',
        status: 200,
        response: { posts: [{ id: 1, title: 'Test' }] },
      });

    const handlers = extendHandlers(userHandler, postHandler);
    const profiles = handlers.createMockProfiles({
      name: 'Mixed Profile',
      actions: ({ useMock, useRealAPI }) => {
        useMock({
          method: 'get',
          path: 'http://localhost/api/users',
          preset: 'empty',
        });
        useRealAPI({
          method: 'get',
          path: 'http://localhost/api/posts',
        });
      },
    });

    // Apply profile
    profiles.useMock('Mixed Profile');

    // Users endpoint should use mock
    let registeredHandlers = server.listHandlers();
    let handlerPaths = registeredHandlers.map((h: any) => h.info.path);
    expect(handlerPaths).toContain('http://localhost/api/users');
    expect(handlerPaths).not.toContain('http://localhost/api/posts');

    // Status should only show mocked endpoint
    const status = handlers.getCurrentStatus();
    expect(status).toHaveLength(1);
    expect(status[0]).toEqual({
      method: 'get',
      path: 'http://localhost/api/users',
      currentPreset: 'empty',
    });
  });

  it('should notify profile subscribers', () => {
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
    const profiles = handlers.createMockProfiles({
      name: 'Empty State',
      actions: ({ useMock }) => {
        useMock({
          method: 'get',
          path: 'http://localhost/api/users',
          preset: 'empty',
        });
      },
    });

    const mockCallback = jest.fn();
    profiles.subscribeToChanges(mockCallback);

    profiles.useMock('Empty State');
    expect(mockCallback).toHaveBeenCalledWith('Empty State');

    profiles.reset();
    expect(mockCallback).toHaveBeenCalledWith(null);
  });

  it('should return available profiles', () => {
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
    const profiles = handlers.createMockProfiles(
      {
        name: 'Profile 1',
        actions: ({ useMock }) => {
          useMock({
            method: 'get',
            path: 'http://localhost/api/users',
            preset: 'empty',
          });
        },
      },
      {
        name: 'Profile 2',
        actions: ({ useMock }) => {
          useMock({
            method: 'get',
            path: 'http://localhost/api/users',
            preset: 'empty',
          });
        },
      }
    );

    const availableProfiles = profiles.getAvailableProfiles();
    expect(availableProfiles).toEqual(['Profile 1', 'Profile 2']);
  });

  it('should handle switching between profiles correctly', async () => {
    const userHandler = http
      .get('http://localhost/api/users', () => {
        return HttpResponse.json({ message: 'default response' });
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

    const postHandler = http
      .get('http://localhost/api/posts', () => {
        return HttpResponse.json({ message: 'default posts' });
      })
      .presets({
        label: 'withPosts',
        status: 200,
        response: { posts: [{ id: 1, title: 'Test Post' }] },
      });

    const handlers = extendHandlers(userHandler, postHandler);

    const profiles = handlers.createMockProfiles(
      {
        name: 'Profile 1',
        actions: ({ useMock }) => {
          useMock({
            method: 'get',
            path: 'http://localhost/api/users',
            preset: 'empty',
          });
          useMock({
            method: 'get',
            path: 'http://localhost/api/posts',
            preset: 'withPosts',
          });
        },
      },
      {
        name: 'Profile 2',
        actions: ({ useMock, useRealAPI }) => {
          useMock({
            method: 'get',
            path: 'http://localhost/api/users',
            preset: 'withUsers',
          });
          useRealAPI({
            method: 'get',
            path: 'http://localhost/api/posts',
          });
        },
      }
    );

    // Apply Profile 1
    profiles.useMock('Profile 1');
    let response = await fetch('http://localhost/api/users');
    let data = await response.json();
    expect(data).toEqual({ users: [] });

    response = await fetch('http://localhost/api/posts');
    data = await response.json();
    expect(data).toEqual({ posts: [{ id: 1, title: 'Test Post' }] });

    // Switch to Profile 2
    profiles.useMock('Profile 2');
    response = await fetch('http://localhost/api/users');
    data = await response.json();
    expect(data.users).toHaveLength(1);
    expect(data.users[0].name).toBe('John');

    // Check if posts endpoint is removed (using real API)
    const handlers2 = server.listHandlers();
    const handlerPaths = handlers2.map((h: any) => h.info.path);
    expect(handlerPaths).toContain('http://localhost/api/users');
    expect(handlerPaths).not.toContain('http://localhost/api/posts');
  });
});
