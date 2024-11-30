import { HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { http, extendHandlers, mockingState } from '..';

const server = setupServer();
const BASE_URL = 'http://localhost';

describe('MSW Preset Extension', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
    mockingState.resetAll(); // Reset mocking state after each test
  });

  afterAll(() => {
    server.close();
  });

  const createTestHandlers = () => {
    const userHandler = http
      .get('/api/users', () => {
        return new HttpResponse(JSON.stringify({ message: 'default users' }), {
          headers: { 'Content-Type': 'application/json' },
        });
      })
      .presets(
        {
          label: 'Empty Users',
          status: 200,
          response: { users: [] },
        },
        {
          label: 'Multiple Users',
          status: 200,
          response: { users: [{ id: 1, name: 'John' }] },
        }
      );

    const postHandler = http
      .post('/api/users', () => {
        return new HttpResponse(JSON.stringify({ message: 'default create' }), {
          headers: { 'Content-Type': 'application/json' },
        });
      })
      .presets(
        {
          label: 'Create Success',
          status: 201,
          response: { id: 1, name: 'John' },
        },
        {
          label: 'Create Error',
          status: 400,
          response: { error: 'Invalid input' },
        }
      );

    return { userHandler, postHandler };
  };

  describe('Handler Information', () => {
    it('should provide handler information correctly', () => {
      const { userHandler, postHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler, postHandler);

      const handlerInfos = handlers.handlers.map((handler) => ({
        method: handler._method,
        path: handler._path,
        presets: handler._presets,
      }));

      expect(handlerInfos).toHaveLength(2);
      expect(handlerInfos[0]).toEqual({
        method: 'get',
        path: '/api/users',
        presets: [
          {
            label: 'Empty Users',
            status: 200,
            response: { users: [] },
          },
          {
            label: 'Multiple Users',
            status: 200,
            response: { users: [{ id: 1, name: 'John' }] },
          },
        ],
      });
    });
  });

  describe('Mocking Status', () => {
    it('should track current mocking status', async () => {
      const { userHandler, postHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler, postHandler);

      server.use(...handlers.handlers);

      handlers.useMock({
        method: 'get',
        path: '/api/users',
        preset: 'Empty Users',
      });

      const status = mockingState.getCurrentStatus();
      expect(status).toHaveLength(1);
      expect(status[0]).toEqual({
        path: '/api/users',
        method: 'get',
        currentPreset: 'Empty Users',
      });
    });

    it('should update status when switching between mock and real', async () => {
      const { userHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler);

      server.use(...handlers.handlers);

      // Set mock
      handlers.useMock({
        method: 'get',
        path: '/api/users',
        preset: 'Empty Users',
      });

      let status = mockingState.getCurrentStatus();
      expect(status[0].currentPreset).toBe('Empty Users');

      // Switch to real API
      handlers.useRealAPI({
        method: 'get',
        path: '/api/users',
      });

      status = mockingState.getCurrentStatus();
      expect(status).toHaveLength(0);
    });
  });

  describe('State Subscription', () => {
    it('should notify subscribers of mocking changes', (done) => {
      const { userHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler);

      server.use(...handlers.handlers);

      const unsubscribe = mockingState.subscribeToChanges(
        ({ mockingStatus, currentProfile }) => {
          expect(mockingStatus).toHaveLength(1);
          expect(mockingStatus[0].currentPreset).toBe('Empty Users');
          expect(currentProfile).toBeNull();
          unsubscribe();
          done();
        }
      );

      handlers.useMock({
        method: 'get',
        path: '/api/users',
        preset: 'Empty Users',
      });
    });
  });

  describe('Mock Profiles', () => {
    it('should manage profiles correctly', () => {
      const { userHandler, postHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler, postHandler);

      server.use(...handlers.handlers);

      const profiles = handlers.createMockProfiles(
        {
          name: 'Empty State',
          actions: ({ useMock }) => {
            useMock({
              method: 'get',
              path: '/api/users',
              preset: 'Empty Users',
            });
          },
        },
        {
          name: 'Error State',
          actions: ({ useMock }) => {
            useMock({
              method: 'post',
              path: '/api/users',
              preset: 'Create Error',
            });
          },
        }
      );

      expect(profiles.getAvailableProfiles()).toEqual([
        'Empty State',
        'Error State',
      ]);
      expect(mockingState.getCurrentProfile()).toBeNull();

      profiles.useMock('Empty State');
      expect(mockingState.getCurrentProfile()).toBe('Empty State');

      const status = mockingState.getCurrentStatus();
      expect(status).toHaveLength(1);
      expect(status[0].currentPreset).toBe('Empty Users');
    });

    it('should handle mixed mock and real API in profile', () => {
      const { userHandler, postHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler, postHandler);

      server.use(...handlers.handlers);

      const profiles = handlers.createMockProfiles({
        name: 'Mixed Profile',
        actions: ({ useMock, useRealAPI }) => {
          useMock({
            method: 'get',
            path: '/api/users',
            preset: 'Empty Users',
          });
          useRealAPI({
            method: 'post',
            path: '/api/users',
          });
        },
      });

      profiles.useMock('Mixed Profile');
      const status = mockingState.getCurrentStatus();

      expect(status).toHaveLength(1);
      expect(status[0].path).toBe('/api/users');
      expect(status[0].method).toBe('get');
    });

    it('should clear previous mocking state when switching profiles', () => {
      const { userHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler);

      const profiles = handlers.createMockProfiles(
        {
          name: 'Profile A',
          actions: ({ useMock }) => {
            useMock({
              method: 'get',
              path: '/api/users',
              preset: 'Empty Users',
            });
          },
        },
        {
          name: 'Profile B',
          actions: ({ useMock }) => {
            useMock({
              method: 'get',
              path: '/api/users',
              preset: 'Multiple Users',
            });
          },
        }
      );

      profiles.useMock('Profile A');
      let status = mockingState.getCurrentStatus();
      expect(status[0].currentPreset).toBe('Empty Users');

      profiles.useMock('Profile B');
      status = mockingState.getCurrentStatus();
      expect(status[0].currentPreset).toBe('Multiple Users');
    });
  });

  describe('Error Handling', () => {
    it('should throw error for invalid preset', () => {
      const { userHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler);

      expect(() => {
        handlers.useMock({
          method: 'get',
          path: '/api/users',
          preset: 'Invalid Preset' as any,
        });
      }).toThrow('Preset not found');
    });

    it('should throw error for invalid profile', () => {
      const { userHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler);

      const profiles = handlers.createMockProfiles({
        name: 'Test Profile',
        actions: () => {},
      });

      expect(() => {
        profiles.useMock('Invalid Profile' as any);
      }).toThrow('Profile not found');
    });
  });

  describe('Mocking State Utils', () => {
    it('should reset single endpoint state', async () => {
      const { userHandler, postHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler, postHandler);

      handlers.useMock({
        method: 'get',
        path: '/api/users',
        preset: 'Empty Users',
      });

      handlers.useMock({
        method: 'post',
        path: '/api/users',
        preset: 'Create Success',
      });

      // Reset only GET endpoint
      mockingState.resetEndpoint('get', '/api/users');

      const status = mockingState.getCurrentStatus();
      expect(status).toHaveLength(1);
      expect(status[0].method).toBe('post');
    });

    it('should get endpoint state correctly', () => {
      const { userHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler);

      handlers.useMock({
        method: 'get',
        path: '/api/users',
        preset: 'Empty Users',
      });

      const state = mockingState.getEndpointState('get', '/api/users');
      expect(state?.preset.label).toBe('Empty Users');

      const nonExistentState = mockingState.getEndpointState(
        'get',
        '/non-existent'
      );
      expect(nonExistentState).toBeUndefined();
    });

    it('should handle subscription cleanup correctly', () => {
      const { userHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler);

      const mockCallback = jest.fn();
      const unsubscribe = mockingState.subscribeToChanges(mockCallback);

      handlers.useMock({
        method: 'get',
        path: '/api/users',
        preset: 'Empty Users',
      });

      expect(mockCallback).toHaveBeenCalled();

      unsubscribe();
      mockingState.resetAll();

      // Should not be called after unsubscribe
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });
});
