import type {
  DefaultBodyType,
  HttpHandler,
  Path,
  PathParams,
  ResponseResolver,
} from 'msw';
import type { HttpRequestResolverExtras } from 'msw/lib/core/handlers/HttpHandler';

// HTTP Method Types
export type HttpMethodLiteral =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'options'
  | 'head'
  | 'all';

// Base Response Types
export type PresetResponse<T, P extends PathParams> =
  | T
  | ((context: HttpRequestResolverExtras<P>) => Promise<T> | T);

export type PresetBase = {
  label: string;
  status: number;
  response: any | (() => Promise<any>);
};

export type Preset = PresetBase;
export type SelectedPreset<T = any> = {
  preset: PresetBase & { response: T | (() => Promise<T>) };
  override?: (draft: { data: T }) => void;
};

export type HttpMethodHandler<M extends HttpMethodLiteral> = <
  Params extends PathParams = PathParams,
  ReqBody extends DefaultBodyType = DefaultBodyType,
  ResBody extends DefaultBodyType = undefined,
  ReqPath extends Path = Path,
>(
  path: ReqPath,
  resolver: ResponseResolver<
    HttpRequestResolverExtras<Params>,
    ReqBody,
    ResBody
  >
) => PresetHandler<ResBody, M, ReqPath, string, ResBody, Params, ReqBody>;

export interface PresetHandler<
  T = any,
  M extends HttpMethodLiteral = HttpMethodLiteral,
  P extends Path = Path,
  L extends string = string,
  R = any,
  Params extends PathParams = PathParams,
  ReqBody extends DefaultBodyType = DefaultBodyType,
> extends HttpHandler {
  presets: <Labels extends string, Response extends DefaultBodyType>(
    ...presets: Array<{
      label: Labels;
      status: number;
      response: PresetResponse<Response, Params>;
    }>
  ) => PresetHandler<T, M, P, Labels, Response, Params, ReqBody>;

  addPreset: <Response extends DefaultBodyType>(
    preset: PresetBase & { response: Response | (() => Promise<Response>) }
  ) => PresetHandler<T, M, P, string, Response, Params, ReqBody>;

  _method: M;
  _path: P;
  _responseType: T;
  _presets: Array<
    PresetBase & { label: L | 'default'; response: R | (() => Promise<R>) }
  >;
  _labels: L | 'default';
  getCurrentPreset: () =>
    | (PresetBase & {
        label: L | 'default';
        response: R | (() => Promise<R>);
      })
    | undefined;
  reset: () => void;
}

// HTTP Interface
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

export type MockingStatus = {
  path: string;
  method: string;
  currentPreset: string | null;
};

export type MockingStateUpdate = {
  status: MockingStatus[];
  currentProfile: string | null;
};

export type StatusSubscriber = (state: MockingStateUpdate) => void;

export interface MockingState {
  getCurrentStatus: () => MockingStatus[];
  getCurrentProfile: <Name extends string = string>() => Name | null;
  subscribeToChanges: (callback: StatusSubscriber) => () => void;
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

export type HandlerInfo<H extends PresetHandler> = {
  method: H['_method'];
  path: H['_path'];
  presets: Array<{
    label: H['_labels'];
    status: number;
    response: H['_responseType'];
  }>;
};

// Utility Types for Type Extraction
export type ExtractMethod<H> =
  H extends PresetHandler<any, infer M, any> ? M : never;
export type ExtractPath<H> =
  H extends PresetHandler<any, any, infer P> ? P : never;
export type ExtractResponseType<H> =
  H extends PresetHandler<infer T> ? T : never;
export type ExtractPresetLabels<H> =
  H extends PresetHandler<any, any, any, infer L> ? L : never;
export type ExtractPresetResponse<H> =
  H extends PresetHandler<any, any, any, any, infer R> ? R : never;

// Mock Profile Types
export type MockProfileHandlers<H extends readonly PresetHandler[]> = {
  handlers: H;
  useMock: ExtendedHandlers<H>['useMock'];
  useRealAPI: ExtendedHandlers<H>['useRealAPI'];
};

export type MockProfile<
  H extends readonly PresetHandler[],
  Name extends string = string,
> = {
  name: Name;
  actions: (handlers: MockProfileHandlers<H>) => void;
};

// Extended Handler Types
export type UseMockOptions<
  H extends readonly PresetHandler[],
  M extends ExtractMethod<H[number]>,
  P extends ExtractPath<H[number]>,
> = {
  method: M;
  path: P;
  preset?:
    | ExtractPresetLabels<Extract<H[number], { _method: M; _path: P }>>
    | 'default';
  response?: any;
  status?: number;
  override?: (draft: {
    data: ExtractPresetResponse<Extract<H[number], { _method: M; _path: P }>>;
  }) => void;
};

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
  getCurrentStatus: () => MockingStatus[];
  reset: () => void;
  subscribeToChanges: (subscriber: StatusSubscriber) => () => void;
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
