import { HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { http, extendHandlers } from '..';
import { mockingState } from '../mockingState';
import { workerManager } from '../worker';

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
});
