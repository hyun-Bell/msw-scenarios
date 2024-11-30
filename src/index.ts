import { produce } from 'immer';
import {
  HttpHandler,
  HttpResponse,
  http as originalHttp,
  PathParams,
  ResponseResolver,
} from 'msw';

type HttpMethod =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'options'
  | 'head'
  | 'all';

type Preset<L extends string = string, R = any> = {
  label: L;
  status: number;
  response: R;
};

interface PresetHandler<
  T = any,
  M extends HttpMethod = HttpMethod,
  P extends string = string,
  L extends string = string,
  R = any,
> extends HttpHandler {
  presets: <Labels extends string, Response>(
    ...presets: Preset<Labels, Response>[]
  ) => PresetHandler<T, M, P, Labels, Response>;
  _method: M;
  _path: P;
  _responseType: T;
  _presets: Preset<L, R>[];
  _labels: L;
}

type HttpMethodHandler<M extends HttpMethod> = <T, P extends string>(
  path: P,
  resolver: ResponseResolver<any, PathParams<string>>
) => PresetHandler<T, M, P>;

type Http = {
  [K in HttpMethod]: HttpMethodHandler<K>;
};

type ExtractMethod<H> =
  H extends PresetHandler<any, infer M, any, any> ? M : never;
type ExtractPath<H> =
  H extends PresetHandler<any, any, infer P, any> ? P : never;
type ExtractLabels<H> =
  H extends PresetHandler<any, any, any, infer L> ? L : never;
type ExtractResponse<H> =
  H extends PresetHandler<infer T, any, any, any> ? T : never;

type ValidPathsForMethod<
  H extends readonly PresetHandler[],
  M extends ExtractMethod<H[number]>,
> = ExtractPath<Extract<H[number], { _method: M }>>;

interface UseMockOptions<
  H extends readonly PresetHandler[],
  M extends ExtractMethod<H[number]>,
  P extends ValidPathsForMethod<H, M>,
  L extends ExtractLabels<
    Extract<H[number], { _method: M; _path: P }>
  > = ExtractLabels<Extract<H[number], { _method: M; _path: P }>>,
> {
  method: M;
  path: P;
  preset: L;
  override?: (draft: {
    data: ExtractResponse<Extract<H[number], { _method: M; _path: P }>>;
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

const presetStore = new Map<string, Preset[]>();
const selectedPresetStore = new Map<
  string,
  { preset: Preset; override?: (draft: { data: any }) => void }
>();

export const http = new Proxy(originalHttp, {
  get<K extends HttpMethod>(
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
        const selected = selectedPresetStore.get(path);

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
      handler._labels = '' as any;

      handler.presets = <Labels extends string, Response>(
        ...presets: Preset<Labels, Response>[]
      ) => {
        if (presets.length > 0) {
          presetStore.set(path, presets);
          handler._presets = presets as any;
          handler._labels = presets[0].label as any;
        }
        return handler as unknown as PresetHandler<T, K, P, Labels, Response>;
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
      const handler = handlers.find(
        (h) => h._path === options.path && h._method === options.method
      );

      if (!handler) {
        throw new Error(
          `No handler found for ${options.method} ${options.path}`
        );
      }

      const presets = handler._presets;

      if (!presets?.length) {
        throw new Error(`No presets found for path: ${options.path}`);
      }

      const preset = presets.find((p) => p.label === options.preset);

      if (!preset) {
        throw new Error(`Preset not found: ${options.preset}`);
      }

      selectedPresetStore.set(options.path, {
        preset,
        override: options.override,
      });
    },
  };
}
