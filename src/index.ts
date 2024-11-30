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

export interface PresetHandler<
  T = any,
  M extends HttpMethodLiteral = HttpMethodLiteral,
  P extends string = string,
  L extends string = string,
  R = any,
> extends HttpHandler {
  presets: <Labels extends string, Response>(
    ...presets: { label: Labels; status: number; response: Response }[]
  ) => PresetHandler<T, M, P, Labels, Response>;
  _method: M;
  _path: P;
  _responseType: T;
  _presets: { label: L; status: number; response: R }[];
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

type ExtractPresetResponse<H, L> =
  H extends PresetHandler<any, any, any, any, infer R> ? R : never;

type ValidPathsForMethod<
  H extends readonly [...any[]],
  M extends ExtractMethod<H[number]>,
> = ExtractPath<Extract<H[number], { _method: M }>>;

interface UseMockOptions<
  H extends readonly [...any[]],
  M extends ExtractMethod<H[number]>,
  P extends ValidPathsForMethod<H, M>,
  L extends ExtractPresetLabels<
    Extract<H[number], { _method: M; _path: P }>
  > = ExtractPresetLabels<Extract<H[number], { _method: M; _path: P }>>,
> {
  method: M;
  path: P;
  preset: L;
  override?: (draft: {
    data: ExtractPresetResponse<
      Extract<H[number], { _method: M; _path: P }>,
      L
    >;
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

const presetStore = new Map<
  string,
  { label: string; status: number; response: any }[]
>();

type SelectedPreset<T = any> = {
  preset: { label: string; status: number; response: T };
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
