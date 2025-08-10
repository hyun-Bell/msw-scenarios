import { produce, Draft } from 'immer';
import {
  HttpResponse,
  HttpHandler,
  http as originalHttp,
  PathParams,
  DefaultBodyType,
  ResponseResolver,
  Path,
} from 'msw';
import { mockingState } from './mockingState';
import { presetActions } from './store/stores';
import {
  Http,
  HttpMethodHandler,
  HttpMethodLiteral,
  PresetHandler,
  SelectedPreset,
  PresetBase,
  PresetResponse,
} from './types';

// Local type for HttpRequestResolverExtras
type HttpRequestResolverExtras<Params = PathParams> = {
  params: Params;
  cookies: Record<string, string>;
  request: Request;
};

/**
 * Factory function to create HTTP method handlers with TypeScript 5 features
 */
function createMethodHandler<K extends HttpMethodLiteral>(
  method: K,
  originalMethod: typeof originalHttp.get
): HttpMethodHandler<K> {
  return function methodHandler<
    const RequestPath extends Path,
    Params extends PathParams = PathParams,
    RequestBodyType extends DefaultBodyType = DefaultBodyType,
    ResponseBodyType extends DefaultBodyType = undefined,
  >(
    path: RequestPath,
    resolver: ResponseResolver<
      HttpRequestResolverExtras<Params>,
      RequestBodyType,
      ResponseBodyType
    >
  ): PresetHandler<ResponseBodyType, K, RequestPath, 'default'> {
    const wrappedResolver: ResponseResolver<
      HttpRequestResolverExtras<Params>,
      RequestBodyType,
      ResponseBodyType
    > = async (info) => {
      const pathStr = typeof path === 'string' ? path : path.toString();
      const state = mockingState.getEndpointState(method, pathStr) as
        | SelectedPreset<ResponseBodyType>
        | undefined;

      if (state) {
        let response = state.preset.response;

        // Handle function responses
        if (typeof response === 'function') {
          // If response is the original resolver, use it directly
          if (response === resolver) {
            return resolver(info);
          }
          // Otherwise, execute the preset function
          response = await (response as (...args: any[]) => any)(info);
        }

        // Apply override if provided
        if (state.override) {
          response = produce(response, (draft) => {
            state.override!({ data: draft as Draft<ResponseBodyType> });
          });
        }

        // Use HttpResponse with proper status
        // MSW will handle the request context internally
        return HttpResponse.json(response as any, {
          status: state.preset.status,
        });
      }

      // No preset active, use original resolver
      return resolver(info);
    };

    // Create base MSW handler
    const baseHandler = originalMethod(path, wrappedResolver) as HttpHandler;

    // Default preset
    const defaultPreset = {
      label: 'default',
      status: 200,
      response: resolver as PresetResponse<ResponseBodyType>,
    };

    // Create preset handler with prototype delegation
    const handler = Object.create(baseHandler) as PresetHandler<
      ResponseBodyType,
      K,
      RequestPath,
      'default'
    >;

    // Add preset-specific properties
    Object.defineProperties(handler, {
      _method: { value: method, enumerable: true },
      _path: { value: path, enumerable: true },
      _responseType: { value: {} as ResponseBodyType, enumerable: true },
      _presets: {
        value: [defaultPreset],
        writable: true,
        enumerable: true,
      },
      _labels: {
        value: 'default' as const,
        writable: true,
        enumerable: true,
      },

      presets: {
        value: function <
          const NewLabels extends string,
          const NewResponse = ResponseBodyType,
        >(
          ...presets: ReadonlyArray<{
            label: NewLabels;
            status: number;
            response: PresetResponse<NewResponse>;
          }>
        ) {
          const pathStr = typeof path === 'string' ? path : path.toString();
          const newPresets = [defaultPreset, ...presets];
          const newHandler = Object.create(baseHandler) as PresetHandler<
            NewResponse,
            K,
            RequestPath,
            NewLabels | 'default'
          >;

          // Copy properties with updated types
          Object.defineProperties(newHandler, {
            _method: { value: method, enumerable: true },
            _path: { value: path, enumerable: true },
            _responseType: { value: {} as NewResponse, enumerable: true },
            _presets: {
              value: newPresets,
              writable: true,
              enumerable: true,
            },
            _labels: {
              value: undefined as any,
              writable: true,
              enumerable: true,
            },
            presets: { value: this.presets, enumerable: true },
            addPreset: { value: this.addPreset, enumerable: true },
            getCurrentPreset: {
              value: this.getCurrentPreset,
              enumerable: true,
            },
            reset: { value: this.reset, enumerable: true },
          });

          presetActions.setPresets(pathStr, newPresets as any);
          return newHandler;
        },
        enumerable: true,
      },

      addPreset: {
        value: function <
          const NewLabels extends string,
          const NewResponse = ResponseBodyType,
        >(preset: PresetBase<NewResponse> & { label: NewLabels }) {
          const pathStr = typeof path === 'string' ? path : path.toString();
          const newPresets = [...this._presets, preset];
          const newHandler = Object.create(baseHandler) as PresetHandler<
            NewResponse,
            K,
            RequestPath,
            | (typeof this._labels extends string
                ? typeof this._labels
                : 'default')
            | NewLabels
          >;

          // Copy properties with updated types
          Object.defineProperties(newHandler, {
            _method: { value: method, enumerable: true },
            _path: { value: path, enumerable: true },
            _responseType: { value: {} as NewResponse, enumerable: true },
            _presets: {
              value: newPresets,
              writable: true,
              enumerable: true,
            },
            _labels: {
              value: undefined as any,
              writable: true,
              enumerable: true,
            },
            presets: { value: this.presets, enumerable: true },
            addPreset: { value: this.addPreset, enumerable: true },
            getCurrentPreset: {
              value: this.getCurrentPreset,
              enumerable: true,
            },
            reset: { value: this.reset, enumerable: true },
          });

          presetActions.setPresets(pathStr, newPresets as any);
          return newHandler;
        },
        enumerable: true,
      },

      getCurrentPreset: {
        value: function () {
          const pathStr = typeof path === 'string' ? path : path.toString();
          const state = mockingState.getEndpointState(method, pathStr);
          return state?.preset;
        },
        enumerable: true,
      },

      reset: {
        value: function () {
          const pathStr = typeof path === 'string' ? path : path.toString();
          mockingState.resetEndpoint(method, pathStr);
        },
        enumerable: true,
      },
    });

    // Initialize presets in store
    const pathStr = typeof path === 'string' ? path : path.toString();
    presetActions.setPresets(pathStr, [defaultPreset] as any);

    return handler;
  } as HttpMethodHandler<K>;
}

/**
 * Enhanced HTTP interface with TypeScript 5 const assertions and satisfies operator
 */
export const http = {
  get: createMethodHandler('get', originalHttp.get),
  post: createMethodHandler('post', originalHttp.post),
  put: createMethodHandler('put', originalHttp.put),
  delete: createMethodHandler('delete', originalHttp.delete),
  patch: createMethodHandler('patch', originalHttp.patch),
  options: createMethodHandler('options', originalHttp.options),
  head: createMethodHandler('head', originalHttp.head),
  all: createMethodHandler('all', originalHttp.all),
} as const satisfies Http;
