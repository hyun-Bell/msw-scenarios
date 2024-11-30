import { HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { http, extendHandlers } from '..';
import { PresetHandler } from '../types';

const server = setupServer();

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

  describe('Handler Management', () => {
    it('should properly extend handlers with additional methods', () => {
      const { userHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler);
      const extendedHandler = handlers.handlers[0] as PresetHandler & {
        getCurrentPreset: () => any;
        reset: () => void;
      };

      expect(extendedHandler.getCurrentPreset).toBeDefined();
      expect(extendedHandler.reset).toBeDefined();
      expect(typeof extendedHandler.getCurrentPreset).toBe('function');
      expect(typeof extendedHandler.reset).toBe('function');
    });

    it('should maintain original handler properties', () => {
      const { userHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler);
      const extendedHandler = handlers.handlers[0];

      expect(extendedHandler._method).toBe('get');
      expect(extendedHandler._path).toBe('/api/users');
      expect(extendedHandler._presets).toHaveLength(2);
    });
  });

  describe('Mock Preset Management', () => {
    it('should set and get current preset', () => {
      const { userHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler);

      handlers.useMock({
        method: 'get',
        path: '/api/users',
        preset: 'Empty Users',
      });

      const currentPreset = (handlers.handlers[0] as any).getCurrentPreset();
      expect(currentPreset).toBeDefined();
      expect(currentPreset.label).toBe('Empty Users');
      expect(currentPreset.response).toEqual({ users: [] });
    });

    it('should handle preset override', () => {
      const { userHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler);

      const override = jest.fn(({ data }) => {
        data.users.push({ id: 2, name: 'Jane' });
      });

      handlers.useMock({
        method: 'get',
        path: '/api/users',
        preset: 'Multiple Users',
        override,
      });

      const currentPreset = (handlers.handlers[0] as any).getCurrentPreset();
      expect(currentPreset.override).toBeDefined();
      expect(currentPreset.override).toBe(override);
    });

    it('should reset preset state', () => {
      const { userHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler);

      handlers.useMock({
        method: 'get',
        path: '/api/users',
        preset: 'Empty Users',
      });

      let currentPreset = (handlers.handlers[0] as any).getCurrentPreset();
      expect(currentPreset).toBeDefined();

      handlers.reset();

      currentPreset = (handlers.handlers[0] as any).getCurrentPreset();
      expect(currentPreset).toBeUndefined();
    });
  });

  describe('Status Tracking', () => {
    it('should track current status of all handlers', () => {
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

      const status = handlers.getCurrentStatus();
      expect(status).toHaveLength(2);
      expect(status).toContainEqual({
        method: 'get',
        path: '/api/users',
        currentPreset: 'Empty Users',
      });
      expect(status).toContainEqual({
        method: 'post',
        path: '/api/users',
        currentPreset: 'Create Success',
      });
    });

    it('should not include handlers without active presets in status', () => {
      const { userHandler, postHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler, postHandler);

      handlers.useMock({
        method: 'get',
        path: '/api/users',
        preset: 'Empty Users',
      });

      const status = handlers.getCurrentStatus();
      expect(status).toHaveLength(1);
      expect(status[0].method).toBe('get');
    });
  });

  describe('Profile Management', () => {
    it('should create and use profiles', () => {
      const { userHandler, postHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler, postHandler);

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
      expect(profiles.getCurrentProfile()).toBeNull();

      profiles.useMock('Empty State');
      expect(profiles.getCurrentProfile()).toBe('Empty State');

      const status = handlers.getCurrentStatus();
      expect(status).toHaveLength(1);
      expect(status[0].currentPreset).toBe('Empty Users');
    });

    it('should reset previous state when switching profiles', () => {
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
      let status = handlers.getCurrentStatus();
      expect(status[0].currentPreset).toBe('Empty Users');

      profiles.useMock('Profile B');
      status = handlers.getCurrentStatus();
      expect(status[0].currentPreset).toBe('Multiple Users');
    });

    it('should handle profile reset', () => {
      const { userHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler);

      const profiles = handlers.createMockProfiles({
        name: 'Test Profile',
        actions: ({ useMock }) => {
          useMock({
            method: 'get',
            path: '/api/users',
            preset: 'Empty Users',
          });
        },
      });

      profiles.useMock('Test Profile');
      expect(profiles.getCurrentProfile()).toBe('Test Profile');
      expect(handlers.getCurrentStatus()).toHaveLength(1);

      profiles.reset();
      expect(profiles.getCurrentProfile()).toBeNull();
      expect(handlers.getCurrentStatus()).toHaveLength(0);
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

  describe('State Subscription', () => {
    it('should notify subscribers when mock state changes', () => {
      const { userHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler);
      const mockSubscriber = jest.fn();

      const unsubscribe = handlers.subscribeToChanges(mockSubscriber);

      handlers.useMock({
        method: 'get',
        path: '/api/users',
        preset: 'Empty Users',
      });

      expect(mockSubscriber).toHaveBeenCalledTimes(1);
      expect(mockSubscriber).toHaveBeenCalledWith({
        status: [
          {
            method: 'get',
            path: '/api/users',
            currentPreset: 'Empty Users',
          },
        ],
        currentProfile: null,
      });

      unsubscribe();
    });

    it('should notify subscribers when switching to real API', () => {
      const { userHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler);
      const mockSubscriber = jest.fn();

      handlers.subscribeToChanges(mockSubscriber);

      // First set a mock
      handlers.useMock({
        method: 'get',
        path: '/api/users',
        preset: 'Empty Users',
      });

      // Then switch to real API
      handlers.useRealAPI({
        method: 'get',
        path: '/api/users',
      });

      expect(mockSubscriber).toHaveBeenCalledTimes(2);
      expect(mockSubscriber).toHaveBeenLastCalledWith({
        status: [],
        currentProfile: null,
      });
    });

    it('should notify subscribers when resetting all handlers', () => {
      const { userHandler, postHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler, postHandler);
      const mockSubscriber = jest.fn();

      handlers.subscribeToChanges(mockSubscriber);

      // Set up some mocks
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

      // Reset all
      handlers.reset();

      expect(mockSubscriber).toHaveBeenLastCalledWith({
        status: [],
        currentProfile: null,
      });
    });

    it('should notify subscribers when switching profiles', () => {
      const { userHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler);
      const mockSubscriber = jest.fn();

      handlers.subscribeToChanges(mockSubscriber);

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

      // Switch to Profile A
      profiles.useMock('Profile A');

      expect(mockSubscriber).toHaveBeenLastCalledWith({
        status: [
          {
            method: 'get',
            path: '/api/users',
            currentPreset: 'Empty Users',
          },
        ],
        currentProfile: 'Profile A',
      });

      // Switch to Profile B
      profiles.useMock('Profile B');

      expect(mockSubscriber).toHaveBeenLastCalledWith({
        status: [
          {
            method: 'get',
            path: '/api/users',
            currentPreset: 'Multiple Users',
          },
        ],
        currentProfile: 'Profile B',
      });
    });

    it('should handle multiple subscribers', () => {
      const { userHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler);
      const subscriber1 = jest.fn();
      const subscriber2 = jest.fn();

      handlers.subscribeToChanges(subscriber1);
      handlers.subscribeToChanges(subscriber2);

      handlers.useMock({
        method: 'get',
        path: '/api/users',
        preset: 'Empty Users',
      });

      expect(subscriber1).toHaveBeenCalledTimes(1);
      expect(subscriber2).toHaveBeenCalledTimes(1);
    });

    it('should properly unsubscribe', () => {
      const { userHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler);
      const mockSubscriber = jest.fn();

      const unsubscribe = handlers.subscribeToChanges(mockSubscriber);
      unsubscribe();

      handlers.useMock({
        method: 'get',
        path: '/api/users',
        preset: 'Empty Users',
      });

      expect(mockSubscriber).not.toHaveBeenCalled();
    });

    describe('error handling', () => {
      let originalConsoleError: typeof console.error;

      beforeEach(() => {
        originalConsoleError = console.error;
        console.error = jest.fn();
      });

      afterEach(() => {
        console.error = originalConsoleError;
      });

      it('should handle subscriber errors gracefully', () => {
        const { userHandler } = createTestHandlers();
        const handlers = extendHandlers(userHandler);

        // 에러를 발생시키는 구독자
        const errorSubscriber = () => {
          throw new Error('Subscriber error');
        };

        // 정상 구독자
        const normalSubscriber = jest.fn();

        // 구독 등록
        handlers.subscribeToChanges(errorSubscriber);
        const unsubscribeNormal = handlers.subscribeToChanges(normalSubscriber);

        // 상태 변경 트리거
        handlers.useMock({
          method: 'get',
          path: '/api/users',
          preset: 'Empty Users',
        });

        // 에러가 로깅되었는지 확인
        expect(console.error).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith(
          'Error in mock state subscriber:',
          expect.any(Error)
        );

        // 정상 구독자가 호출되었는지 확인
        expect(normalSubscriber).toHaveBeenCalledTimes(1);

        // 정리
        unsubscribeNormal();
      });

      it('should allow other subscribers to continue after one fails', () => {
        const { userHandler } = createTestHandlers();
        const handlers = extendHandlers(userHandler);

        const subscriber1 = jest.fn();
        const subscriber2 = () => {
          throw new Error('Subscriber 2 error');
        };
        const subscriber3 = jest.fn();

        handlers.subscribeToChanges(subscriber1);
        handlers.subscribeToChanges(subscriber2);
        handlers.subscribeToChanges(subscriber3);

        handlers.useMock({
          method: 'get',
          path: '/api/users',
          preset: 'Empty Users',
        });

        expect(subscriber1).toHaveBeenCalled();
        expect(subscriber3).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalled();
      });
    });
  });

  describe('Profile Management', () => {
    it('should notify profile subscribers when switching profiles', () => {
      const { userHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler);
      const mockProfileSubscriber = jest.fn();

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

      profiles.subscribeToChanges(mockProfileSubscriber);

      // Initial state
      expect(mockProfileSubscriber).not.toHaveBeenCalled();
      expect(profiles.getCurrentProfile()).toBeNull();

      // Switch to Profile A
      profiles.useMock('Profile A');
      expect(mockProfileSubscriber).toHaveBeenCalledWith('Profile A');
      expect(profiles.getCurrentProfile()).toBe('Profile A');

      // Switch to Profile B
      profiles.useMock('Profile B');
      expect(mockProfileSubscriber).toHaveBeenCalledWith('Profile B');
      expect(profiles.getCurrentProfile()).toBe('Profile B');

      // Reset profiles
      profiles.reset();
      expect(mockProfileSubscriber).toHaveBeenCalledWith(null);
      expect(profiles.getCurrentProfile()).toBeNull();

      expect(mockProfileSubscriber).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple profile subscribers', () => {
      const { userHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler);
      const subscriber1 = jest.fn();
      const subscriber2 = jest.fn();

      const profiles = handlers.createMockProfiles({
        name: 'Test Profile',
        actions: () => {},
      });

      profiles.subscribeToChanges(subscriber1);
      profiles.subscribeToChanges(subscriber2);

      profiles.useMock('Test Profile');

      expect(subscriber1).toHaveBeenCalledWith('Test Profile');
      expect(subscriber2).toHaveBeenCalledWith('Test Profile');
    });

    it('should properly unsubscribe profile subscribers', () => {
      const { userHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler);
      const mockSubscriber = jest.fn();

      const profiles = handlers.createMockProfiles({
        name: 'Test Profile',
        actions: () => {},
      });

      const unsubscribe = profiles.subscribeToChanges(mockSubscriber);
      unsubscribe();

      profiles.useMock('Test Profile');
      expect(mockSubscriber).not.toHaveBeenCalled();
    });

    it('should handle profile subscriber errors gracefully', () => {
      const { userHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler);
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const errorSubscriber = () => {
        throw new Error('Subscriber error');
      };
      const normalSubscriber = jest.fn();

      const profiles = handlers.createMockProfiles({
        name: 'Test Profile',
        actions: () => {},
      });

      profiles.subscribeToChanges(errorSubscriber);
      profiles.subscribeToChanges(normalSubscriber);

      profiles.useMock('Test Profile');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in profile subscriber:',
        expect.any(Error)
      );
      expect(normalSubscriber).toHaveBeenCalledWith('Test Profile');

      consoleSpy.mockRestore();
    });

    it('should notify both handlers and profile subscribers when switching profiles', () => {
      const { userHandler } = createTestHandlers();
      const handlers = extendHandlers(userHandler);
      const handlerSubscriber = jest.fn();
      const profileSubscriber = jest.fn();

      const profiles = handlers.createMockProfiles({
        name: 'Test Profile',
        actions: ({ useMock }) => {
          useMock({
            method: 'get',
            path: '/api/users',
            preset: 'Empty Users',
          });
        },
      });

      handlers.subscribeToChanges(handlerSubscriber);
      profiles.subscribeToChanges(profileSubscriber);

      profiles.useMock('Test Profile');

      expect(profileSubscriber).toHaveBeenCalledWith('Test Profile');
      expect(handlerSubscriber).toHaveBeenCalledWith({
        status: [
          {
            method: 'get',
            path: '/api/users',
            currentPreset: 'Empty Users',
          },
        ],
        currentProfile: 'Test Profile',
      });
    });
  });
});
