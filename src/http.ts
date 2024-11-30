// Main HTTP handler with preset capabilities.
import { produce } from 'immer';
import {
  HttpResponse,
  http as originalHttp,
  PathParams,
  ResponseResolver,
} from 'msw';
import { presetStore, SelectedPreset, selectedPresetStore } from './stores';
import {
  Http,
  HttpMethodHandler,
  HttpMethodLiteral,
  PresetHandler,
} from './types';

/**
 * Proxy wrapping original HTTP methods to add preset capabilities.
 */
export const http = new Proxy(originalHttp, {
  get<K extends HttpMethodLiteral>(
    target: typeof originalHttp,
    method: K
  ): HttpMethodHandler<K> {
    const originalMethod = Reflect.get(target, method);
    if (typeof originalMethod !== 'function') {
      return originalMethod;
    }

    return <T, P extends string>(
      path: P,
      resolver: ResponseResolver<any, PathParams<string>>
    ): PresetHandler<T, K, P, string, T> => {
      const wrappedResolver: typeof resolver = async (info) => {
        const selected = selectedPresetStore.get(path) as
          | SelectedPreset<T>
          | undefined;

        if (selected) {
          let response = selected.preset.response;

          if (selected.override) {
            response = produce(response, (draft: T) => {
              selected.override!({ data: draft });
            });
          }

          return new HttpResponse(JSON.stringify(response), {
            status: selected.preset.status,
          });
        }

        return resolver(info);
      };

      const handler = originalMethod(path, wrappedResolver) as PresetHandler<
        T,
        K,
        P,
        string,
        T
      >;

      handler._method = method;
      handler._path = path;
      handler._responseType = {} as T;
      handler._presets = [];

      handler.presets = <Labels extends string, Response>(
        ...presets: { label: Labels; status: number; response: Response }[]
      ) => {
        if (presets.length > 0) {
          presetStore.set(path, presets);
          handler._presets = presets as any;
          (handler as any)._labels = presets[0].label;
        }
        return handler as unknown as PresetHandler<T, K, P, Labels, Response>;
      };

      return handler;
    };
  },
}) as Http;
