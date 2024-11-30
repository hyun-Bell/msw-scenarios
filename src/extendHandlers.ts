import type {
  ExtendedHandlers,
  ExtractMethod,
  ExtractPath,
  MockProfile,
  PresetHandler,
  ProfileManager,
  UseMockOptions,
} from './types';

type HandlerState = {
  currentPreset?: {
    label: string;
    status: number;
    response: any;
    override?: (draft: { data: any }) => void;
  };
};

type Subscriber = (state: {
  status: Array<{
    path: string;
    method: string;
    currentPreset: string | null;
  }>;
  currentProfile: string | null;
}) => void;

const handlerStates = new WeakMap<PresetHandler, HandlerState>();
const subscribers = new Set<Subscriber>();

function getHandlerState(handler: PresetHandler) {
  if (!handlerStates.has(handler)) {
    handlerStates.set(handler, {});
  }
  return handlerStates.get(handler)!;
}

function notifySubscribers(
  handlers: readonly PresetHandler[],
  currentProfile: string | null
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

export function extendHandlers<H extends readonly PresetHandler[]>(
  ...handlers: H
): ExtendedHandlers<H> {
  let currentProfile: string | null = null;

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

    notifySubscribers(handlers, currentProfile);
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

    notifySubscribers(handlers, currentProfile);
  };

  const resetAllHandlers = () => {
    handlers.forEach((handler) => {
      const state = getHandlerState(handler);
      state.currentPreset = undefined;
    });
    currentProfile = null;
    notifySubscribers(handlers, currentProfile);
  };

  // 핸들러에 확장 메서드 추가
  handlers.forEach((handler) => {
    Object.defineProperties(handler, {
      getCurrentPreset: {
        value: () => {
          const state = getHandlerState(handler);
          return state.currentPreset;
        },
        enumerable: true,
      },
      reset: {
        value: () => {
          const state = getHandlerState(handler);
          state.currentPreset = undefined;
          notifySubscribers(handlers, currentProfile);
        },
        enumerable: true,
      },
    });
  });

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
    subscribeToChanges: (subscriber: Subscriber) => {
      subscribers.add(subscriber);
      return () => {
        subscribers.delete(subscriber);
      };
    },
    createMockProfiles: <
      Name extends string,
      Profile extends MockProfile<H, Name>,
      Profiles extends readonly [Profile, ...Profile[]],
    >(
      ...profiles: Profiles
    ): ProfileManager<Profiles> => {
      return {
        profiles,
        useMock(profileName: Profiles[number]['name']) {
          const profile = profiles.find((p) => p.name === profileName);
          if (!profile) {
            throw new Error(`Profile not found: ${profileName}`);
          }

          resetAllHandlers();
          currentProfile = profileName;

          profile.actions({
            handlers,
            useMock: useMockFunction,
            useRealAPI: useRealAPIFunction,
          });
        },
        getAvailableProfiles: () => profiles.map((p) => p.name),
        getCurrentProfile: () =>
          currentProfile as Profiles[number]['name'] | null,
        reset: resetAllHandlers,
      };
    },
  };
}
