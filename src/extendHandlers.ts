import { selectedPresetActions } from './store/stores';
import {
  ExtendedHandlers,
  ExtractMethod,
  ExtractPath,
  MockProfile,
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

    selectedPresetActions.setSelected(options.path, {
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

    selectedPresetActions.clearSelected(options.path);
  };

  return {
    handlers,
    useMock: useMockFunction,
    useRealAPI: useRealAPIFunction,
    createMockProfiles<
      Name extends string,
      Profile extends MockProfile<H, Name>,
      Profiles extends readonly [Profile, ...Profile[]],
    >(...profiles: Profiles) {
      return {
        profiles,
        useMock(profileName: Profiles[number]['name']) {
          const profile = profiles.find((p) => p.name === profileName);
          if (!profile) {
            throw new Error(`Profile not found: ${profileName}`);
          }

          // Clear all presets before applying new profile
          selectedPresetActions.clearSelected();

          profile.actions({
            handlers,
            useMock: useMockFunction,
            useRealAPI: useRealAPIFunction,
          });
        },
      };
    },
  };
}
