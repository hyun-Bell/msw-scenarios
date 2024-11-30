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

type HandlerState = {
  currentPreset?: {
    label: string;
    status: number;
    response: any;
    override?: (draft: { data: any }) => void;
  };
};

const handlerStates = new WeakMap<PresetHandler, HandlerState>();

function getHandlerState(handler: PresetHandler) {
  if (!handlerStates.has(handler)) {
    handlerStates.set(handler, {});
  }
  return handlerStates.get(handler)!;
}

export function extendHandlers<H extends readonly PresetHandler[]>(
  ...handlers: H
): ExtendedHandlers<H> {
  const subscribers = new Set<
    (state: { status: MockingStatus[]; currentProfile: string | null }) => void
  >();
  let rootCurrentProfile: string | null = null;

  // 핸들러 메서드 확장
  handlers.forEach((handler) => {
    Object.defineProperties(handler, {
      getCurrentPreset: {
        value: () => {
          return getHandlerState(handler).currentPreset;
        },
        enumerable: true,
      },
      reset: {
        value: () => {
          const state = getHandlerState(handler);
          state.currentPreset = undefined;
          notifySubscribers(handlers, rootCurrentProfile, subscribers);
        },
        enumerable: true,
      },
    });
  });

  function notifySubscribers(
    handlers: readonly PresetHandler[],
    currentProfile: string | null,
    subscribers: Set<
      (state: {
        status: MockingStatus[];
        currentProfile: string | null;
      }) => void
    >
  ) {
    const state = {
      status: handlers
        .map((handler) => ({
          path: handler._path,
          method: handler._method,
          currentPreset: getHandlerState(handler).currentPreset?.label ?? null,
        }))
        .filter((status) => status.currentPreset !== null),
      currentProfile,
    };

    for (const subscriber of subscribers) {
      try {
        subscriber(state);
      } catch (error) {
        console.error('Error in mock state subscriber:', error);
      }
    }
  }

  function resetAllHandlers() {
    handlers.forEach((handler) => {
      const state = getHandlerState(handler);
      state.currentPreset = undefined;
    });
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

    const preset = handler._presets.find((p) => p.label === options.preset);
    if (!preset) {
      throw new Error(`Preset not found: ${options.preset}`);
    }

    const state = getHandlerState(handler);
    state.currentPreset = {
      ...preset,
      override: options.override,
    };

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

    const state = getHandlerState(handler);
    state.currentPreset = undefined;

    notifySubscribers(handlers, rootCurrentProfile, subscribers);
  };

  return {
    handlers,
    useMock: useMockFunction,
    useRealAPI: useRealAPIFunction,
    getCurrentStatus: () => {
      return handlers
        .map((handler) => {
          const state = getHandlerState(handler);
          return {
            path: handler._path,
            method: handler._method,
            currentPreset: state.currentPreset?.label ?? null,
          };
        })
        .filter((status) => status.currentPreset !== null);
    },
    reset: resetAllHandlers,
    subscribeToChanges: (callback) => {
      subscribers.add(callback);
      return () => {
        subscribers.delete(callback);
      };
    },
    createMockProfiles: <
      Name extends string,
      Profile extends MockProfile<H, Name>,
      Profiles extends readonly [Profile, ...Profile[]],
    >(
      ...profiles: Profiles
    ): ProfileManager<Profiles> => {
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
    },
  };
}
