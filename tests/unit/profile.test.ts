import { HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { http, extendHandlers } from '../../src';
import { mockingState } from '../../src/mockingState';
import { workerManager } from '../../src/worker';

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
        return HttpResponse.json({ message: 'default' });
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

    profiles.useMock('Empty State');
    let response = await fetch('http://localhost/api/users');
    let data = await response.json();
    expect(data).toEqual({ users: [] });

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

  it('should clear existing presets when switching profiles', async () => {
    // Setup handlers with multiple endpoints
    const userHandler = http
      .get('http://localhost/api/users', () => {
        return HttpResponse.json({ message: 'default' });
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
      .presets(
        {
          label: 'noPosts',
          status: 200,
          response: { posts: [] },
        },
        {
          label: 'withPosts',
          status: 200,
          response: { posts: [{ id: 1, title: 'Post 1' }] },
        }
      );

    const handlers = extendHandlers(userHandler, postHandler);

    // Create profiles with different preset configurations
    const profiles = handlers.createMockProfiles(
      {
        name: 'Profile 1',
        actions: ({ useMock }) => {
          useMock({
            method: 'get',
            path: 'http://localhost/api/users',
            preset: 'withUsers',
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
        actions: ({ useMock }) => {
          useMock({
            method: 'get',
            path: 'http://localhost/api/users',
            preset: 'empty',
          });
          // Note: posts endpoint is not configured in Profile 2
        },
      }
    );

    // Apply Profile 1
    profiles.useMock('Profile 1');

    // Verify Profile 1 settings
    let usersResponse = await fetch('http://localhost/api/users');
    let usersData = await usersResponse.json();
    expect(usersData.users).toHaveLength(1);
    expect(usersData.users[0].name).toBe('John');

    let postsResponse = await fetch('http://localhost/api/posts');
    let postsData = await postsResponse.json();
    expect(postsData.posts).toHaveLength(1);
    expect(postsData.posts[0].title).toBe('Post 1');

    // Switch to Profile 2
    profiles.useMock('Profile 2');

    // Verify Profile 2 settings
    usersResponse = await fetch('http://localhost/api/users');
    usersData = await usersResponse.json();
    expect(usersData.users).toHaveLength(0); // Should be empty array

    // Posts endpoint should return to default handler
    postsResponse = await fetch('http://localhost/api/posts');
    postsData = await postsResponse.json();
    expect(postsData).toEqual({ message: 'default posts' }); // Should be default response
  });
});
