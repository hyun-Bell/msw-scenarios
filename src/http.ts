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

      // 핸들러 생성
      const handler = Reflect.apply(originalMethod, target, [
        path,
        wrappedResolver,
      ]) as PresetHandler<T, K, P, string, T>;

      // 핸들러 속성 초기화
      Object.defineProperties(handler, {
        _method: { value: method, enumerable: true },
        _path: { value: path, enumerable: true },
        _responseType: { value: {} as T, enumerable: true },
        _presets: {
          value: [],
          enumerable: true,
          writable: true, // presets 메서드에서 수정할 수 있도록 writable로 설정
        },
        presets: {
          value: function <Labels extends string, Response>(
            ...presetConfigs: {
              label: Labels;
              status: number;
              response: Response;
            }[]
          ) {
            if (presetConfigs.length > 0) {
              // Store presets in presetActions
              presetActions.setPresets(path, presetConfigs);

              // 기존 프리셋에 새로운 프리셋 추가
              this._presets = [...(this._presets || []), ...presetConfigs];

              // Create a new handler with the same properties
              const updatedHandler = Object.create(
                Object.getPrototypeOf(this),
                Object.getOwnPropertyDescriptors(this)
              ) as PresetHandler<T, K, P, Labels, Response>;

              return updatedHandler;
            }
            return this as unknown as PresetHandler<T, K, P, Labels, Response>;
          },
          enumerable: true,
        },
      });

      return handler;
    };
  },
}) as Http;
