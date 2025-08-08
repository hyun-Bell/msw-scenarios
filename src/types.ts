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

export type HttpMethodLiteral = typeof HttpMethods[keyof typeof HttpMethods];

// Simplified Response Types using TypeScript 5 features
export type PresetResponseFunction<T, P extends PathParams = PathParams> = (
  context: HttpRequestResolverExtras<P>
) => Promise<T> | T;

export type PresetResponse<T = unknown, P extends PathParams = PathParams> =
  | T
  | PresetResponseFunction<T, P>;

// Core Preset Types with improved type safety
export interface PresetBase<T = unknown> {
  readonly label: string;
  readonly status: number;
  readonly response: PresetResponse<T>;
}

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
) => PresetHandler<ResBody, M, ReqPath>;

// Simplified PresetHandler with better type inference and variance
export interface PresetHandler<
  out Response = unknown,
  out Method extends HttpMethodLiteral = HttpMethodLiteral,
  out RequestPath extends Path = Path,
> extends HttpHandler {
  readonly _method: Method;
  readonly _path: RequestPath;
  readonly _responseType: Response;
  readonly _presets: ReadonlyArray<PresetBase<Response>>;
  
  presets<const Labels extends string, const NewResponse = Response>(
    ...presets: ReadonlyArray<{
      label: Labels;
      status: number;
      response: PresetResponse<NewResponse>;
    }>
  ): PresetHandler<NewResponse, Method, RequestPath>;

  addPreset<const NewResponse = Response>(
    preset: PresetBase<NewResponse>
  ): PresetHandler<NewResponse, Method, RequestPath>;

  getCurrentPreset(): PresetBase<Response> | undefined;
  reset(): void;
}

// HTTP Interface with const assertion for better type safety
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
  getEndpointState(
    method: string,
    path: string
  ): SelectedPreset | undefined;
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

// Simplified Utility Types using TypeScript 5 NoInfer
export type ExtractMethod<H> = H extends PresetHandler<any, infer M> ? M : never;
export type ExtractPath<H> = H extends PresetHandler<any, any, infer P> ? P : never;
export type ExtractResponseType<H> = H extends PresetHandler<infer R> ? R : never;

// Mock Profile Types with const type parameters
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

// Helper type to extract response type based on method and path
type ExtractHandlerByMethodAndPath<
  H extends readonly PresetHandler[],
  M extends HttpMethodLiteral,
  P extends Path
> = Extract<H[number], { _method: M; _path: P }>;

type ExtractResponseByMethodAndPath<
  H extends readonly PresetHandler[],
  M extends HttpMethodLiteral,
  P extends Path
> = ExtractHandlerByMethodAndPath<H, M, P> extends PresetHandler<infer R> ? R : never;

// Extended Handler Types with improved type inference and narrowing
export interface UseMockOptions<
  H extends readonly PresetHandler[],
  M extends ExtractMethod<H[number]> = ExtractMethod<H[number]>,
  P extends ExtractPath<H[number]> = ExtractPath<H[number]>,
> {
  method: M;
  path: P;
  preset?: string;
  response?: ExtractResponseByMethodAndPath<H, M, P>;
  status?: number;
  override?: (draft: { data: Draft<ExtractResponseByMethodAndPath<H, M, P>> }) => void;
}

export interface ExtendedHandlers<H extends readonly PresetHandler[]> {
  readonly handlers: H;
  
  useMock<
    const M extends ExtractMethod<H[number]>,
    const P extends ExtractPath<H[number]>,
  >(options: UseMockOptions<H, M, P>): void;
  
  useRealAPI<
    const M extends ExtractMethod<H[number]>,
    const P extends ExtractPath<H[number]>,
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
  >(...profiles: Profiles): ProfileManager<Profiles>;
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

// Type helper for better inference
export type InferHandlerResponse<H> = H extends PresetHandler<infer R> ? R : never;
export type InferHandlerMethod<H> = H extends PresetHandler<any, infer M> ? M : never;
export type InferHandlerPath<H> = H extends PresetHandler<any, any, infer P> ? P : never;