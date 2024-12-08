import { HttpHandler, PathParams, ResponseResolver } from 'msw';

export type HttpMethodLiteral =
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
  getCurrentPreset: () => { label: L; status: number; response: R } | undefined;
  reset: () => void;
}

export type HttpMethodHandler<M extends HttpMethodLiteral> = <
  T,
  P extends string,
>(
  path: P,
  resolver: ResponseResolver<any, PathParams<string>>
) => PresetHandler<T, M, P>;

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

export interface MockProfileManager<
  Profiles extends readonly MockProfile<any, any>[],
> {
  profiles: Profiles;
  useMock: (profileName: Profiles[number]['name']) => void;
  getAvailableProfiles: () => Array<Profiles[number]['name']>;
  getCurrentProfile: () => Profiles[number]['name'] | null;
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
  preset: { label: string; status: number; response: T };
  override?: (draft: { data: T }) => void;
};

export type Preset = {
  label: string;
  status: number;
  response: any;
};
