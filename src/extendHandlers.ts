import { selectedPresetActions } from './store/stores';
import { ExtendedHandlers, PresetHandler, SelectedPreset } from './types';

export function extendHandlers<H extends readonly PresetHandler[]>(
  ...handlers: H
): ExtendedHandlers<H> {
  return {
    handlers,
    useMock(options) {
      const handler = handlers.find((h) => {
        const handlerPath = h._path;
        const handlerMethod = h._method;
        return handlerPath === options.path && handlerMethod === options.method;
      }) as Extract<
        H[number],
        { _method: typeof options.method; _path: typeof options.path }
      >;

      if (!handler) {
        throw new Error(
          `No handler found for ${options.method} ${options.path}`
        );
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
    },
  };
}
