import { produce } from 'immer';
import {
  HttpResponse,
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
} from './types';
import { HttpRequestResolverExtras } from 'msw/lib/core/handlers/HttpHandler';

function createMethodHandler<K extends HttpMethodLiteral>(
  method: K,
  originalMethod: Function
): HttpMethodHandler<K> {
  return <
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
  ): PresetHandler<
    ResponseBodyType,
    K,
    RequestPath,
    string,
    ResponseBodyType,
    Params,
    RequestBodyType
  > => {
    const wrappedResolver: typeof resolver = async (info) => {
      const selected = mockingState.getEndpointState(
        method,
        typeof path === 'string' ? path : path.toString()
      ) as SelectedPreset<ResponseBodyType> | undefined;

      if (selected) {
        let response = selected.preset.response;

        if (selected.override) {
          response = produce(response, (draft: ResponseBodyType) => {
            selected.override!({ data: draft });
          });
        }

        return HttpResponse.json(response, {
          status: selected.preset.status,
        });
      }

      return resolver(info);
    };

    const handler = originalMethod(path, wrappedResolver) as PresetHandler<
      ResponseBodyType,
      K,
      RequestPath,
      string,
      ResponseBodyType,
      Params,
      RequestBodyType
    >;

    handler._method = method;
    handler._path = path;
    handler._responseType = {} as ResponseBodyType;
    handler._presets = [];

    handler.presets = <Labels extends string, Response extends DefaultBodyType>(
      ...presets: { label: Labels; status: number; response: Response }[]
    ) => {
      handler._presets = presets as any;
      (handler as any)._labels = presets[0].label;

      presetActions.setPresets(
        typeof path === 'string' ? path : path.toString(),
        presets
      );

      return handler as unknown as PresetHandler<
        ResponseBodyType,
        K,
        RequestPath,
        Labels,
        Response,
        Params,
        RequestBodyType
      >;
    };

    return handler;
  };
}

export const http: Http = {
  get: createMethodHandler('get', originalHttp.get),
  post: createMethodHandler('post', originalHttp.post),
  put: createMethodHandler('put', originalHttp.put),
  delete: createMethodHandler('delete', originalHttp.delete),
  patch: createMethodHandler('patch', originalHttp.patch),
  options: createMethodHandler('options', originalHttp.options),
  head: createMethodHandler('head', originalHttp.head),
  all: createMethodHandler('all', originalHttp.all),
};
