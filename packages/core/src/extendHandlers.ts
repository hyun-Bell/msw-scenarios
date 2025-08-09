import type {
  ExtendedHandlers,
  ExtractMethod,
  ExtractPath,
  MockProfile,
  PresetHandler,
  ProfileManager,
  UseMockOptions,
  MockingStatus,
  StatusSubscriber,
  SelectedPreset,
} from './types';
import { mockingState } from './mockingState';
import { workerManager } from './worker';

/**
 * Type-safe path conversion utility with TypeScript 5 template literal types
 */
function pathToString<T extends string | { toString(): string }>(
  path: T
): string {
  return typeof path === 'string' ? path : path.toString();
}

/**
 * Notify subscribers with improved type safety using TypeScript 5 features
 */
function notifySubscribers(
  handlers: readonly PresetHandler[],
  currentProfile: string | null,
  subscribers: Set<StatusSubscriber>
) {
  const status = handlers
    .map((handler) => {
      const state = mockingState.getEndpointState(
        handler._method,
        pathToString(handler._path)
      );

      // Don't include handlers set to use real API
      if (state?.preset.label === '__REAL_API__') {
        return null;
      }

      return {
        path: pathToString(handler._path),
        method: handler._method,
        currentPreset: state?.preset.label || 'default',
      } as const;
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);

  const state = { status, currentProfile };

  for (const subscriber of subscribers) {
    try {
      subscriber(state);
    } catch (error) {
      console.error('Error in mock state subscriber:', error);
    }
  }
}

/**
 * Create extended handlers with enhanced TypeScript 5 type inference
 */
export function extendHandlers<const H extends readonly PresetHandler[]>(
  ...handlers: H
): ExtendedHandlers<H> {
  const subscribers = new Set<StatusSubscriber>();
  let rootCurrentProfile: string | null = null;

  workerManager.registerHandlers([...handlers]);

  // 저장된 상태 복원
  const restoreSavedState = () => {
    const savedState = mockingState.getCurrentStatus();
    if (savedState && savedState.length > 0) {
      console.log('[MSW] Restoring saved preset state...');
      savedState.forEach((status) => {
        const handler = handlers.find(
          (h) => h._path === status.path && h._method === status.method
        );
        if (handler) {
          const preset = handler._presets.find(
            (p) => p.label === status.currentPreset
          );
          if (preset) {
            mockingState.setSelected(status.method, pathToString(status.path), {
              preset: {
                label: preset.label,
                status: preset.status,
                response: preset.response,
              },
            });
          }
        }
      });
      workerManager.updateHandlers();
      console.log('[MSW] Preset state restored successfully');
    }
  };

  // 브라우저 환경에서만 상태 복원
  if (typeof window !== 'undefined') {
    // 약간의 지연 후 복원 (MSW worker 초기화 대기)
    setTimeout(restoreSavedState, 100);
  }

  handlers.forEach((handler) => {
    // Check if methods are already defined to avoid re-definition
    if (!handler.getCurrentPreset) {
      Object.defineProperty(handler, 'getCurrentPreset', {
        value: () => {
          const state = mockingState.getEndpointState(
            handler._method,
            pathToString(handler._path)
          );
          return state?.preset.label === '__REAL_API__'
            ? undefined
            : state?.preset;
        },
        enumerable: true,
        configurable: true,
      });
    }

    if (!handler.reset) {
      Object.defineProperty(handler, 'reset', {
        value: () => {
          mockingState.setSelected(
            handler._method,
            pathToString(handler._path),
            { preset: handler._presets[0] }
          );
          workerManager.updateHandlers();
          notifySubscribers(handlers, rootCurrentProfile, subscribers);
        },
        enumerable: true,
        configurable: true,
      });
    }
  });

  function resetAllHandlers() {
    handlers.forEach((handler) => {
      mockingState.setSelected(handler._method, pathToString(handler._path), {
        preset: handler._presets[0],
      });
    });
    workerManager.updateHandlers();
    notifySubscribers(handlers, rootCurrentProfile, subscribers);
  }

  const useMockFunction = <
    const M extends ExtractMethod<H[number]>,
    const P extends ExtractPath<H[number]>,
  >(
    options: UseMockOptions<H, M, P>
  ) => {
    const handler = handlers.find(
      (h) => h._path === options.path && h._method === options.method
    ) as Extract<H[number], { _method: M; _path: P }> | undefined;

    if (!handler) {
      throw new Error(`No handler found for ${options.method} ${options.path}`);
    }

    if (options.response !== undefined) {
      mockingState.setSelected(options.method, pathToString(options.path), {
        preset: {
          label: 'dynamic',
          status: options.status || 200,
          response: options.response,
        },
        override: options.override,
      } as SelectedPreset);
    } else if (options.preset) {
      const preset = handler._presets.find((p) => p.label === options.preset);
      if (!preset) {
        throw new Error(`Preset not found: ${options.preset}`);
      }

      mockingState.setSelected(options.method, pathToString(options.path), {
        preset: {
          label: preset.label,
          status: preset.status,
          response: preset.response,
        },
        override: options.override,
      } as SelectedPreset);
    } else {
      throw new Error('Either preset or response must be provided');
    }

    workerManager.updateHandlers();
    notifySubscribers(handlers, rootCurrentProfile, subscribers);
  };

  const useRealAPIFunction = <
    const M extends ExtractMethod<H[number]>,
    const P extends ExtractPath<H[number]>,
  >(options: {
    method: M;
    path: P;
  }) => {
    const handler = handlers.find(
      (h) => h._path === options.path && h._method === options.method
    );

    if (!handler) {
      throw new Error(`No handler found for ${options.method} ${options.path}`);
    }

    mockingState.setSelected(options.method, pathToString(options.path), {
      preset: {
        label: '__REAL_API__',
        status: 200,
        response: {},
      },
    });

    workerManager.updateHandlers();
    notifySubscribers(handlers, rootCurrentProfile, subscribers);
  };

  function createMockProfiles<
    const Name extends string,
    const Profile extends MockProfile<H, Name>,
    const Profiles extends readonly [Profile, ...Profile[]],
  >(...profiles: Profiles): ProfileManager<Profiles> {
    let currentProfile: Profiles[number]['name'] | null = null;
    const profileSubscribers = new Set<
      (currentProfile: Profiles[number]['name'] | null) => void
    >();

    function notifyProfileSubscribers(
      profile: Profiles[number]['name'] | null
    ) {
      for (const subscriber of profileSubscribers) {
        try {
          subscriber(profile);
        } catch (error) {
          console.error('Error in profile subscriber:', error);
        }
      }
    }

    return {
      profiles,
      useMock(profileName) {
        const profile = profiles.find((p) => p.name === profileName);
        if (!profile) {
          throw new Error(`Profile not found: ${profileName}`);
        }

        resetAllHandlers();

        currentProfile = profileName;
        rootCurrentProfile = profileName;
        mockingState.setCurrentProfile(profileName);

        profile.actions({
          handlers,
          useMock: useMockFunction,
          useRealAPI: useRealAPIFunction,
        });

        notifyProfileSubscribers(currentProfile);
        notifySubscribers(handlers, currentProfile, subscribers);
      },
      getAvailableProfiles: () =>
        profiles.map((p) => p.name) as ReadonlyArray<Profiles[number]['name']>,
      getCurrentProfile: () => currentProfile,
      reset: () => {
        resetAllHandlers();
        currentProfile = null;
        rootCurrentProfile = null;
        mockingState.setCurrentProfile(null);
        notifyProfileSubscribers(null);
        notifySubscribers(handlers, null, subscribers);
      },
      subscribeToChanges: (callback) => {
        profileSubscribers.add(callback);
        return () => {
          profileSubscribers.delete(callback);
        };
      },
    };
  }

  return {
    handlers,
    useMock: useMockFunction,
    useRealAPI: useRealAPIFunction,
    getCurrentStatus: (): ReadonlyArray<MockingStatus> => {
      const statuses: MockingStatus[] = [];

      for (const handler of handlers) {
        const state = mockingState.getEndpointState(
          handler._method,
          pathToString(handler._path)
        );

        // Don't include handlers set to use real API
        if (state?.preset.label !== '__REAL_API__') {
          statuses.push({
            path: pathToString(handler._path),
            method: handler._method,
            currentPreset: state?.preset.label || 'default',
          });
        }
      }

      return statuses;
    },
    reset: resetAllHandlers,
    subscribeToChanges: (callback) => {
      subscribers.add(callback);
      return () => {
        subscribers.delete(callback);
      };
    },
    createMockProfiles,
  } as const;
}
