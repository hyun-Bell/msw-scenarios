import { mockingState } from './mockingState';
import {
  ExtendedHandlers,
  ExtractMethod,
  ExtractPath,
  MockProfile,
  MockProfileManager,
  PresetHandler,
  SelectedPreset,
  UseMockOptions,
} from './types';

export function extendHandlers<H extends readonly PresetHandler[]>(
  ...handlers: H
): ExtendedHandlers<H> {
  const useMockFunction = (options: UseMockOptions<H, any, any>) => {
    const handler = handlers.find((h) => {
      const handlerPath = h._path;
      const handlerMethod = h._method;
      return handlerPath === options.path && handlerMethod === options.method;
    }) as Extract<
      H[number],
      { _method: typeof options.method; _path: typeof options.path }
    >;

    if (!handler) {
      throw new Error(`No handler found for ${options.method} ${options.path}`);
    }

    const presets = handler._presets;

    if (!presets || presets.length === 0) {
      throw new Error(`No presets found for path: ${options.path}`);
    }

    const preset = presets.find((p) => p.label === options.preset);

    if (!preset) {
      throw new Error(`Preset not found: ${options.preset}`);
    }

    mockingState.setSelected(options.method, options.path, {
      preset,
      override: options.override,
    } as SelectedPreset);
  };

  const useRealAPIFunction = <
    M extends ExtractMethod<H[number]>,
    P extends ExtractPath<H[number]>,
  >(options: {
    method: M;
    path: P;
  }) => {
    const handler = handlers.find((h) => {
      const handlerPath = h._path;
      const handlerMethod = h._method;
      return handlerPath === options.path && handlerMethod === options.method;
    });

    if (!handler) {
      throw new Error(`No handler found for ${options.method} ${options.path}`);
    }

    mockingState.resetEndpoint(options.method, options.path);
  };

  return {
    handlers,
    useMock: useMockFunction,
    useRealAPI: useRealAPIFunction,
    createMockProfiles<
      Name extends string,
      Profile extends MockProfile<H, Name>,
      Profiles extends readonly [Profile, ...Profile[]],
    >(...profiles: Profiles): MockProfileManager<Profiles> {
      return {
        profiles,
        useMock(profileName: any) {
          const profile = profiles.find((p) => p.name === profileName);
          if (!profile) {
            throw new Error(`Profile not found: ${profileName}`);
          }

          mockingState.resetAll();
          mockingState.setCurrentProfile(profileName);

          profile.actions({
            handlers,
            useMock: useMockFunction,
            useRealAPI: useRealAPIFunction,
          });
        },
        getAvailableProfiles: () => profiles.map((p) => p.name),
        getCurrentProfile: () =>
          mockingState.getCurrentProfile<Profiles[number]['name']>(),
      };
    },
  };
}
