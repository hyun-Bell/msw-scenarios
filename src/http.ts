import { produce } from 'immer';
import {
  HttpResponse,
  http as originalHttp,
  PathParams,
  ResponseResolver,
} from 'msw';
import { mockingState } from './mockingState';
import { presetActions } from './store/stores';
import {
  Http,
  HttpMethodHandler,
  HttpMethodLiteral,
  PresetHandler,
  SelectedPreset,
} from './types';

export const http = new Proxy(originalHttp, {
  get<K extends HttpMethodLiteral>(
    target: typeof originalHttp,
    method: K,
    receiver: any
  ): HttpMethodHandler<K> {
    const originalMethod = Reflect.get(target, method, receiver);
    if (typeof originalMethod !== 'function') {
      return originalMethod;
    }

    return <T, P extends string>(
      path: P,
      resolver: ResponseResolver<any, PathParams<string>>
    ): PresetHandler<T, K, P, string, T> => {
      const wrappedResolver: typeof resolver = async (info) => {
        const selected = mockingState.getEndpointState(method, path) as
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
            headers: {
              'Content-Type': 'application/json',
            },
          });
        }

        return resolver(info);
      };

      const handler = Reflect.apply(originalMethod, target, [
        path,
        wrappedResolver,
      ]) as PresetHandler<T, K, P, string, T>;

      handler._method = method;
      handler._path = path;
      handler._responseType = {} as T;
      handler._presets = [];

      handler.presets = <Labels extends string, Response>(
        ...presets: { label: Labels; status: number; response: Response }[]
      ) => {
        if (presets.length > 0) {
          presetActions.setPresets(path, presets);
          handler._presets = presets as any;
          (handler as any)._labels = presets[0].label;
        }
        return handler as unknown as PresetHandler<T, K, P, Labels, Response>;
      };

      return handler;
    };
  },
}) as Http;
