import type {
  DefaultBodyType,
  HttpHandler,
  Path,
  PathParams,
  ResponseResolver,
} from 'msw';
import type { HttpRequestResolverExtras } from 'msw/lib/core/handlers/HttpHandler';

export type HttpMethodLiteral =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'options'
  | 'head'
  | 'all';

export type HttpMethodHandler<M extends HttpMethodLiteral> = <
  Params extends PathParams<keyof Params> = PathParams,
  RequestBodyType extends DefaultBodyType = DefaultBodyType,
  ResponseBodyType extends DefaultBodyType = undefined,
  RequestPath extends Path = Path,
>(
  path: RequestPath,
  resolver: ResponseResolver<
    HttpRequestResolverExtras<Params>,
    RequestBodyType,
    ResponseBodyType
  >
) => PresetHandler<
  ResponseBodyType,
  M,
  RequestPath,
  string,
  ResponseBodyType,
  Params,
  RequestBodyType
>;

export interface PresetHandler<
  T = any,
  M extends HttpMethodLiteral = HttpMethodLiteral,
  P extends Path = Path,
  L extends string = string,
  R = any,
  Params extends PathParams<keyof Params> = PathParams,
  RequestBody extends DefaultBodyType = DefaultBodyType,
> extends HttpHandler {
  presets: <Labels extends string, Response extends DefaultBodyType>(
    ...presets: Array<{
      label: Labels;
      status: number;
      response: Response | (() => Promise<Response>);
    }>
  ) => PresetHandler<T, M, P, Labels, Response, Params, RequestBody>;

  addPreset: <Response extends DefaultBodyType>(preset: {
    label: string;
    status: number;
    response: Response | (() => Promise<Response>);
  }) => PresetHandler<T, M, P, string, Response, Params, RequestBody>;

  _method: M;
  _path: P;
  _responseType: T;
  _presets: Array<{
    label: L | 'default';
    status: number;
    response: R | (() => Promise<R>);
  }>;
  _labels: L | 'default';
  getCurrentPreset: () =>
    | {
        label: L | 'default';
        status: number;
        response: R | (() => Promise<R>);
      }
    | undefined;
  reset: () => void;
}

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

export interface HandlerInfo<H extends PresetHandler> {
  method: H['_method'];
  path: H['_path'];
  presets: Array<{
    label: H['_labels'];
    status: number;
    response: H['_responseType'];
  }>;
}

export interface MockingStatus {
  path: string;
  method: string;
  currentPreset: string | null;
}

export interface MockingState {
  getCurrentStatus: () => Array<MockingStatus>;
  getCurrentProfile: <Name extends string = string>() => Name | null;
  subscribeToChanges: <Name extends string = string>(
    callback: (state: {
      mockingStatus: Array<MockingStatus>;
      currentProfile: Name | null;
    }) => void
  ) => () => void;
  resetAll: () => void;
  resetEndpoint: (method: string, path: string) => void;
  getEndpointState: (
    method: string,
    path: string
  ) => SelectedPreset | undefined;
  setSelected: (method: string, path: string, preset: SelectedPreset) => void;
  setCurrentProfile: <Name extends string = string>(
    profileName: Name | null
  ) => void;
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

export interface MockProfileHandlers<H extends readonly PresetHandler[]> {
  handlers: H;
  useMock: ExtendedHandlers<H>['useMock'];
  useRealAPI: ExtendedHandlers<H>['useRealAPI'];
}

export interface MockProfile<
  H extends readonly PresetHandler[],
  Name extends string = string,
> {
  name: Name;
  actions: (handlers: MockProfileHandlers<H>) => void;
}

export interface UseMockOptions<
  H extends readonly PresetHandler[],
  M extends ExtractMethod<H[number]>,
  P extends ExtractPath<H[number]>,
> {
  method: M;
  path: P;
  preset?:
    | ExtractPresetLabels<Extract<H[number], { _method: M; _path: P }>>
    | 'default';
  response?: any;
  status?: number;
  override?: (draft: {
    data: ExtractPresetResponse<
      Extract<H[number], { _method: M; _path: P }>,
      any
    >;
  }) => void;
}

export interface ExtendedHandlers<H extends readonly PresetHandler[]> {
  handlers: H;
  useMock: <
    M extends ExtractMethod<H[number]>,
    P extends ExtractPath<H[number]>,
  >(
    options: UseMockOptions<H, M, P>
  ) => void;
  useRealAPI: <
    M extends ExtractMethod<H[number]>,
    P extends ExtractPath<H[number]>,
  >(options: {
    method: M;
    path: P;
  }) => void;
  getCurrentStatus: () => Array<{
    path: string;
    method: string;
    currentPreset: string | null;
  }>;
  reset: () => void;
  subscribeToChanges: (
    subscriber: (state: {
      status: Array<{
        path: string;
        method: string;
        currentPreset: string | null;
      }>;
      currentProfile: string | null;
    }) => void
  ) => () => void;
  createMockProfiles: <
    Name extends string,
    Profile extends MockProfile<H, Name>,
    Profiles extends readonly [Profile, ...Profile[]],
  >(
    ...profiles: Profiles
  ) => ProfileManager<Profiles>;
}

export interface ProfileManager<
  Profiles extends readonly MockProfile<any, any>[],
> {
  profiles: Profiles;
  useMock: (profileName: Profiles[number]['name']) => void;
  getAvailableProfiles: () => Array<Profiles[number]['name']>;
  getCurrentProfile: () => Profiles[number]['name'] | null;
  reset: () => void;
  subscribeToChanges: (
    callback: (currentProfile: Profiles[number]['name'] | null) => void
  ) => () => void;
}

export type SelectedPreset<T = any> = {
  preset: {
    label: string;
    status: number;
    response: T | (() => Promise<T>);
  };
  override?: (draft: { data: T }) => void;
};

export type Preset = {
  label: string;
  status: number;
  response: any | (() => Promise<any>);
};
