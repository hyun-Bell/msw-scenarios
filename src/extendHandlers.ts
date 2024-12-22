import type {
  ExtendedHandlers,
  ExtractMethod,
  ExtractPath,
  MockProfile,
  PresetHandler,
  ProfileManager,
  UseMockOptions,
  MockingStatus,
} from './types';
import { mockingState } from './mockingState';
import { workerManager } from './worker';

function pathToString(path: string | { toString(): string }): string {
  return typeof path === 'string' ? path : path.toString();
}

function notifySubscribers(
  handlers: readonly PresetHandler[],
  currentProfile: string | null,
  subscribers: Set<
    (state: { status: MockingStatus[]; currentProfile: string | null }) => void
  >
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
      };
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

export function extendHandlers<H extends readonly PresetHandler[]>(
  ...handlers: H
): ExtendedHandlers<H> {
  const subscribers = new Set<
    (state: { status: MockingStatus[]; currentProfile: string | null }) => void
  >();
  let rootCurrentProfile: string | null = null;

  workerManager.registerHandlers([...handlers]);

  handlers.forEach((handler) => {
    Object.defineProperties(handler, {
      getCurrentPreset: {
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
      },
      reset: {
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
      },
    });
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
    M extends ExtractMethod<H[number]>,
    P extends ExtractPath<H[number]>,
  >(
    options: UseMockOptions<H, M, P>
  ) => {
    const handler = handlers.find(
      (h) => h._path === options.path && h._method === options.method
    ) as Extract<H[number], { _method: M; _path: P }>;

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
      });
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
      });
    } else {
      throw new Error('Either preset or response must be provided');
    }

    workerManager.updateHandlers();
    notifySubscribers(handlers, rootCurrentProfile, subscribers);
  };

  const useRealAPIFunction = <
    M extends ExtractMethod<H[number]>,
    P extends ExtractPath<H[number]>,
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
    Name extends string,
    Profile extends MockProfile<H, Name>,
    Profiles extends readonly [Profile, ...Profile[]],
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
      getAvailableProfiles: () => profiles.map((p) => p.name),
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
    getCurrentStatus: () => {
      return handlers
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
          };
        })
        .filter((s): s is NonNullable<typeof s> => s !== null);
    },
    reset: resetAllHandlers,
    subscribeToChanges: (callback) => {
      subscribers.add(callback);
      return () => {
        subscribers.delete(callback);
      };
    },
    createMockProfiles,
  };
}
