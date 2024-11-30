import { HttpHandler, PathParams, ResponseResolver } from 'msw';

/**
 * Supported HTTP methods.
 */
export type HttpMethodLiteral =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'options'
  | 'head'
  | 'all';

/**
 * PresetHandler interface to define a handler with preset responses.
 */
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

/**
 * HttpMethodHandler definition for handling different HTTP methods.
 */
export type HttpMethodHandler<M extends HttpMethodLiteral> = <
  T,
  P extends string,
>(
  path: P,
  resolver: ResponseResolver<any, PathParams<string>>
) => PresetHandler<T, M, P>;

/**
 * Http interface for method handlers.
 */
export interface Http {
  get: HttpMethodHandler<'get'>;
  post: HttpMethodHandler<'post'>;
  put: HttpMethodHandler<'put'>;
  delete: HttpMethodHandler<'delete'>;
  patch: HttpMethodHandler<'patch'>;
  options: HttpMethodHandler<'options'>;
  head: HttpMethodHandler<'head'>;
  all: HttpMethodHandler<'all'>;
}

export type ExtractMethod<H> =
  H extends PresetHandler<any, infer M, any, any> ? M : never;

export type ExtractPath<H> =
  H extends PresetHandler<any, any, infer P, any> ? P : never;

export type ExtractResponseType<H> =
  H extends PresetHandler<infer T, any, any, any> ? T : never;

export type ExtractPresetLabels<H> =
  H extends PresetHandler<any, any, any, infer L> ? L : never;

export type ExtractPresetResponse<H, L> =
  H extends PresetHandler<any, any, any, any, infer R> ? R : never;

export interface ExtendedHandlers<H extends readonly PresetHandler[]> {
  handlers: H;
  useMock: <
    M extends ExtractMethod<H[number]>,
    P extends ExtractPath<H[number]>,
  >(
    options: UseMockOptions<H, M, P>
  ) => void;
}

export interface UseMockOptions<
  H extends readonly [...any[]],
  M extends ExtractMethod<H[number]>,
  P extends ExtractPath<H[number]>,
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

// src/stores.ts
// Stores to keep track of presets and selected responses.
export const presetStore = new Map<
  string,
  { label: string; status: number; response: any }[]
>();

export const selectedPresetStore = new Map<string, SelectedPreset>();

export type SelectedPreset<T = any> = {
  preset: { label: string; status: number; response: T };
  override?: (draft: { data: T }) => void;
};

export type Preset = {
  label: string;
  status: number;
  response: any;
};
