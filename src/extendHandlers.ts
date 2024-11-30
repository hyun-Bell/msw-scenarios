import { selectedPresetActions, selectedPresetStore } from './store/stores';
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
    });

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

    selectedPresetActions.setSelected(options.method, options.path, {
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

    selectedPresetActions.clearSelected(options.method, options.path);
  };

  return {
    handlers,
    useMock: useMockFunction,
    useRealAPI: useRealAPIFunction,
    getRegisteredHandlers: () => {
      return handlers.map((handler) => ({
        method: handler._method,
        path: handler._path,
        presets: handler._presets,
      }));
    },
    getCurrentMockingStatus: () => {
      const state = selectedPresetStore.getState();
      return Object.entries(state.selected).map(([key, selected]) => {
        const [method, path] = key.split(':');
        return {
          path,
          method,
          currentPreset: selected.preset.label,
        };
      });
    },
    subscribeToChanges: (callback) => {
      return selectedPresetStore.subscribe((state) => {
        const mockingStatus = Object.entries(state.selected).map(
          ([path, selected]) => ({
            path,
            method: handlers.find((h) => h._path === path)?._method ?? '',
            currentPreset: selected.preset.label,
          })
        );

        callback({
          mockingStatus,
          currentProfile: state.currentProfile,
        });
      });
    },
    createMockProfiles<
      Name extends string,
      Profile extends MockProfile<H, Name>,
      Profiles extends readonly [Profile, ...Profile[]],
    >(...profiles: Profiles): MockProfileManager<Profiles> {
      return {
        profiles,
        useMock(profileName: Profiles[number]['name']) {
          const profile = profiles.find((p) => p.name === profileName);
          if (!profile) {
            throw new Error(`Profile not found: ${profileName}`);
          }

          // 모든 상태를 초기화하기 위해 clearAll 사용
          selectedPresetActions.clearAll();
          selectedPresetActions.setCurrentProfile(profileName);

          profile.actions({
            handlers,
            useMock: useMockFunction,
            useRealAPI: useRealAPIFunction,
          });
        },
        getAvailableProfiles: () => profiles.map((p) => p.name),
        getCurrentProfile: () =>
          selectedPresetActions.getCurrentProfile() as
            | Profiles[number]['name']
            | null,
      };
    },
  };
}
