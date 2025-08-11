import type {
  DefaultBodyType,
  HttpHandler,
  Path,
  PathParams,
  ResponseResolver,
} from 'msw';
import type { Draft } from 'immer';
// Import from MSW core for TypeScript 5 compatibility
type HttpRequestResolverExtras<Params = PathParams> = {
  params: Params;
  cookies: Record<string, string>;
  request: Request;
};

// HTTP Method Types with const assertion for better type inference
export const HttpMethods = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  DELETE: 'delete',
  PATCH: 'patch',
  OPTIONS: 'options',
  HEAD: 'head',
  ALL: 'all',
} as const;

export type HttpMethodLiteral = (typeof HttpMethods)[keyof typeof HttpMethods];

// Simplified Response Types using TypeScript 5 features
export type PresetResponseFunction<T, P extends PathParams = PathParams> = (
  context: HttpRequestResolverExtras<P>
) => Promise<T> | T;

export type PresetResponse<T = unknown, P extends PathParams = PathParams> =
  | T
  | PresetResponseFunction<T, P>;

export interface PresetBase<T = unknown> {
  /** Unique identifier for this preset */
  readonly label: string;
  /** HTTP status code (e.g., 200, 404, 500) */
  readonly status: number;
  /** Response data or function that generates response */
  readonly response: PresetResponse<T>;
}

// For backward compatibility - will be removed in next major version
export type Preset<T = unknown> = PresetBase<T>;

export interface SelectedPreset<T = unknown> {
  readonly preset: PresetBase<T>;
  readonly override?: (draft: { data: Draft<T> }) => void;
}

// Simplified HTTP Method Handler using TypeScript 5 const type parameters
export type HttpMethodHandler<M extends HttpMethodLiteral> = <
  const ReqPath extends Path,
  Params extends PathParams = PathParams,
  ReqBody extends DefaultBodyType = DefaultBodyType,
  ResBody extends DefaultBodyType = undefined,
>(
  path: ReqPath,
  resolver: ResponseResolver<
    HttpRequestResolverExtras<Params>,
    ReqBody,
    ResBody
  >
) => PresetHandler<ResBody, M, ReqPath, 'default'>;

/**
 * MSW handler with preset management capabilities
 */
export interface PresetHandler<
  out Response = unknown,
  out Method extends HttpMethodLiteral = HttpMethodLiteral,
  out RequestPath extends Path = Path,
  out Labels extends string = string,
> extends HttpHandler {
  readonly _method: Method;
  readonly _path: RequestPath;
  readonly _responseType: Response;
  readonly _presets: ReadonlyArray<
    PresetBase<Response> & { label: Labels | 'default' }
  >;
  readonly _labels: Labels | 'default';

  presets<const NewLabels extends string, const NewResponse = Response>(
    ...presets: ReadonlyArray<{
      label: NewLabels;
      status: number;
      response: PresetResponse<NewResponse>;
    }>
  ): PresetHandler<NewResponse, Method, RequestPath, NewLabels | 'default'>;

  addPreset<const NewLabels extends string, const NewResponse = Response>(
    preset: PresetBase<NewResponse> & { label: NewLabels }
  ): PresetHandler<NewResponse, Method, RequestPath, Labels | NewLabels>;

  getCurrentPreset(): PresetBase<Response> | undefined;
  reset(): void;
}

export interface Http {
  readonly get: HttpMethodHandler<'get'>;
  readonly post: HttpMethodHandler<'post'>;
  readonly put: HttpMethodHandler<'put'>;
  readonly delete: HttpMethodHandler<'delete'>;
  readonly patch: HttpMethodHandler<'patch'>;
  readonly options: HttpMethodHandler<'options'>;
  readonly head: HttpMethodHandler<'head'>;
  readonly all: HttpMethodHandler<'all'>;
}

// Mocking State Types with improved structure
export interface MockingStatus {
  readonly path: string;
  readonly method: string;
  readonly currentPreset: string | null;
}

export interface MockingStateUpdate {
  readonly status: ReadonlyArray<MockingStatus>;
  readonly currentProfile: string | null;
}

export type StatusSubscriber = (state: MockingStateUpdate) => void;

export interface MockingState {
  getCurrentStatus(): ReadonlyArray<MockingStatus>;
  getCurrentProfile<Name extends string = string>(): Name | null;
  subscribeToChanges(callback: StatusSubscriber): () => void;
  resetAll(): void;
  resetEndpoint(method: string, path: string): void;
  getEndpointState(method: string, path: string): SelectedPreset | undefined;
  setSelected(method: string, path: string, preset: SelectedPreset): void;
  setCurrentProfile<Name extends string = string>(
    profileName: Name | null
  ): void;
}

// Simplified Handler Info using TypeScript 5 satisfies operator
export type HandlerInfo<H extends PresetHandler> = {
  method: H['_method'];
  path: H['_path'];
  presets: ReadonlyArray<{
    label: string;
    status: number;
    response: H['_responseType'];
  }>;
};

export interface MockProfileHandlers<H extends readonly PresetHandler[]> {
  readonly handlers: H;
  readonly useMock: ExtendedHandlers<H>['useMock'];
  readonly useRealAPI: ExtendedHandlers<H>['useRealAPI'];
}

export interface MockProfile<
  H extends readonly PresetHandler[],
  Name extends string = string,
> {
  readonly name: Name;
  readonly actions: (handlers: MockProfileHandlers<H>) => void;
}

// Simplified helper type to extract handler by method and path
type ExtractHandlerByMethodAndPath<
  H extends readonly PresetHandler[],
  M extends HttpMethodLiteral,
  P extends Path,
> = Extract<H[number], { _method: M; _path: P }>;

// Direct extraction without complex chains for better performance
type ExtractResponseByMethodAndPath<
  H extends readonly PresetHandler[],
  M extends HttpMethodLiteral,
  P extends Path,
> =
  ExtractHandlerByMethodAndPath<H, M, P> extends PresetHandler<
    infer R,
    HttpMethodLiteral,
    Path,
    string
  >
    ? R
    : never;

// Extract preset labels for a specific handler
type ExtractPresetLabels<
  H extends readonly PresetHandler[],
  M extends HttpMethodLiteral,
  P extends Path,
> =
  ExtractHandlerByMethodAndPath<H, M, P> extends PresetHandler<
    unknown,
    HttpMethodLiteral,
    Path,
    infer L
  >
    ? L
    : never;

// Extended Handler Types with improved type inference and narrowing
export interface UseMockOptions<
  H extends readonly PresetHandler[],
  M extends HandlerUtilsGetMethod<H[number]> = HandlerUtilsGetMethod<H[number]>,
  P extends HandlerUtilsGetPath<H[number]> = HandlerUtilsGetPath<H[number]>,
> {
  method: M;
  path: P;
  preset?: ExtractPresetLabels<H, M, P>;
  response?: ExtractResponseByMethodAndPath<H, M, P>;
  status?: number;
  override?: (draft: {
    data: Draft<ExtractResponseByMethodAndPath<H, M, P>>;
  }) => void;
}

export interface ExtendedHandlers<H extends readonly PresetHandler[]> {
  readonly handlers: H;

  useMock<
    const M extends HandlerUtilsGetMethod<H[number]>,
    const P extends HandlerUtilsGetPath<H[number]>,
  >(
    options: UseMockOptions<H, M, P>
  ): void;

  useRealAPI<
    const M extends HandlerUtilsGetMethod<H[number]>,
    const P extends HandlerUtilsGetPath<H[number]>,
  >(options: {
    method: M;
    path: P;
  }): void;

  getCurrentStatus(): ReadonlyArray<MockingStatus>;
  reset(): void;
  subscribeToChanges(subscriber: StatusSubscriber): () => void;

  createMockProfiles<
    const Name extends string,
    const Profile extends MockProfile<H, Name>,
    const Profiles extends readonly [Profile, ...Profile[]],
  >(
    ...profiles: Profiles
  ): ProfileManager<Profiles>;
}

export interface ProfileManager<
  Profiles extends readonly MockProfile<any, any>[],
> {
  readonly profiles: Profiles;
  useMock(profileName: Profiles[number]['name']): void;
  getAvailableProfiles(): ReadonlyArray<Profiles[number]['name']>;
  getCurrentProfile(): Profiles[number]['name'] | null;
  reset(): void;
  subscribeToChanges(
    callback: (currentProfile: Profiles[number]['name'] | null) => void
  ): () => void;
}

// Type utilities - replacing duplicated Extract*/Infer* helpers
export type HandlerUtilsGetResponse<H> =
  H extends PresetHandler<infer R, HttpMethodLiteral, Path, string> ? R : never;

export type HandlerUtilsGetMethod<H> =
  H extends PresetHandler<unknown, infer M, Path, string> ? M : never;

export type HandlerUtilsGetPath<H> =
  H extends PresetHandler<unknown, HttpMethodLiteral, infer P, string>
    ? P
    : never;

export type HandlerUtilsGetLabels<H> =
  H extends PresetHandler<unknown, HttpMethodLiteral, Path, infer L>
    ? L
    : never;

// Re-export deprecated types for backward compatibility
export type {
  InferHandlerResponse,
  InferHandlerMethod,
  InferHandlerPath,
  InferHandlerLabels,
  ExtractMethod,
  ExtractPath,
  ExtractResponseType,
} from './types.deprecated';

// Runtime type guards
export function isPresetHandler(value: unknown): value is PresetHandler {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;
  return (
    '_method' in obj &&
    typeof obj._method === 'string' &&
    '_path' in obj &&
    typeof obj._path === 'string' &&
    '_presets' in obj &&
    Array.isArray(obj._presets)
  );
}

export function hasPreset<L extends string>(
  handler: PresetHandler,
  label: L
): handler is PresetHandler<unknown, HttpMethodLiteral, Path, L> {
  return handler._presets.some((preset) => preset.label === label);
}

export function isMockingStatus(value: unknown): value is MockingStatus {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;
  return (
    'path' in obj &&
    typeof obj.path === 'string' &&
    'method' in obj &&
    typeof obj.method === 'string' &&
    'currentPreset' in obj &&
    (obj.currentPreset === null || typeof obj.currentPreset === 'string')
  );
}

export function isPresetBase<T = unknown>(
  value: unknown
): value is PresetBase<T> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;
  return (
    'label' in obj &&
    typeof obj.label === 'string' &&
    'status' in obj &&
    typeof obj.status === 'number' &&
    'response' in obj
  );
}
