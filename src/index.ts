import { produce } from 'immer';
import {
  HttpHandler,
  HttpResponse,
  http as originalHttp,
  PathParams,
  ResponseResolver,
} from 'msw';

type HttpMethodLiteral =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'options'
  | 'head'
  | 'all';

export interface Preset<T = any> {
  label: string;
  status: number;
  response: T;
}

export interface PresetHandler<
  T = any,
  M extends HttpMethodLiteral = HttpMethodLiteral,
  P extends string = string,
  L extends string = string,
> extends HttpHandler {
  presets: <Labels extends string>(
    ...presets: { label: Labels; status: number; response: T }[]
  ) => PresetHandler<T, M, P, Labels>;
  _method: M;
  _path: P;
  _responseType: T;
  _presets: Preset<T>[];
  _labels: L;
}

type HttpMethodHandler<M extends HttpMethodLiteral> = <T, P extends string>(
  path: P,
  resolver: ResponseResolver<any, PathParams<string>>
) => PresetHandler<T, M, P>;

interface Http {
  get: HttpMethodHandler<'get'>;
  post: HttpMethodHandler<'post'>;
  put: HttpMethodHandler<'put'>;
  delete: HttpMethodHandler<'delete'>;
  patch: HttpMethodHandler<'patch'>;
  options: HttpMethodHandler<'options'>;
  head: HttpMethodHandler<'head'>;
  all: HttpMethodHandler<'all'>;
}

type ExtractMethod<H> =
  H extends PresetHandler<any, infer M, any, any> ? M : never;

type ExtractPath<H> =
  H extends PresetHandler<any, any, infer P, any> ? P : never;

type ExtractResponseType<H> =
  H extends PresetHandler<infer T, any, any, any> ? T : never;

type ExtractPresetLabels<H> =
  H extends PresetHandler<any, any, any, infer L> ? L : never;

type ValidPathsForMethod<
  H extends readonly [...any[]],
  M extends ExtractMethod<H[number]>,
> = ExtractPath<Extract<H[number], { _method: M }>>;

interface UseMockOptions<
  H extends readonly [...any[]],
  M extends ExtractMethod<H[number]>,
  P extends ValidPathsForMethod<H, M>,
> {
  method: M;
  path: P;
  preset: ExtractPresetLabels<Extract<H[number], { _method: M; _path: P }>>;
  override?: (draft: {
    data: ExtractResponseType<Extract<H[number], { _method: M; _path: P }>>;
  }) => void;
}

export interface ExtendedHandlers<H extends readonly PresetHandler[]> {
  handlers: H;
  useMock: <
    M extends ExtractMethod<H[number]>,
    P extends ValidPathsForMethod<H, M>,
  >(
    options: UseMockOptions<H, M, P>
  ) => void;
}

const presetStore = new Map<string, Preset<any>[]>();

type SelectedPreset<T = any> = {
  preset: Preset<T>;
  override?: (draft: { data: T }) => void;
};

const selectedPresetStore = new Map<string, SelectedPreset>();

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
    ): PresetHandler<T, K, P> => {
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
            headers: {
              'Content-Type': 'application/json',
            },
          });
        }

        return resolver(info);
      };

      const handler = originalMethod(path, wrappedResolver) as PresetHandler<
        T,
        K,
        P
      >;

      handler._method = method;
      handler._path = path;
      handler._responseType = {} as T;
      handler._presets = [];

      handler.presets = <Labels extends string>(
        ...presets: { label: Labels; status: number; response: T }[]
      ) => {
        if (presets.length > 0) {
          presetStore.set(path, presets);
          handler._presets = presets;
          (handler as any)._labels = presets[0].label;
        }
        return handler as PresetHandler<T, K, P, Labels>;
      };

      return handler;
    };
  },
}) as Http;

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

      selectedPresetStore.set(options.path, {
        preset,
        override: options.override,
      } as SelectedPreset);
    },
  };
}

// // 사용 예시
// const handlers = [
//   http
//     .get('/users', () => {
//       return new HttpResponse(JSON.stringify([{ id: 1, name: 'John' }]), {
//         status: 200,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
//     })
//     .presets({
//       label: 'success',
//       status: 200,
//       response: [{ id: 1, name: 'John' }],
//     }),
//   http
//     .post('/users', () => {
//       return new HttpResponse(JSON.stringify({ id: 1, name: 'John' }), {
//         status: 201,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
//     })
//     .presets({
//       label: 'success2',
//       status: 201,
//       response: { id: 1, name: 'John' },
//     }),
// ];

// const extended = extendHandlers(...handlers);

// extended.useMock({
//   method: 'post',
//   path: '/users',
//   preset: 'success2', // 'success'로 자동완성됨
// });
