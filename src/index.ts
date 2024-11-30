import {
  HttpHandler,
  HttpResponse,
  DefaultBodyType,
  http as originalHttp,
  HttpRequestHandler,
  ResponseResolver,
  PathParams,
  Path,
} from 'msw';
import { produce } from 'immer';

// Preset 타입 정의
export interface Preset {
  label: string;
  status: number;
  response: any;
}

// useMock 옵션 타입 정의
interface UseMockOptions<T = any> {
  method: string;
  path: string;
  preset: string;
  override?: (draft: { data: T }) => void;
}

// 확장된 핸들러 인터페이스
export interface PresetHandler extends HttpHandler {
  presets: (...presets: Preset[]) => PresetHandler;
}

// 확장된 핸들러 컬렉션 인터페이스
export interface ExtendedHandlers {
  handlers: HttpHandler[];
  useMock: (options: UseMockOptions) => void;
}

// 확장된 HTTP 메서드 타입
type HttpMethod = <RequestData extends DefaultBodyType = DefaultBodyType>(
  path: string,
  resolver: ResponseResolver<any, any>
) => PresetHandler;

// 확장된 HTTP 객체 타입
interface ExtendedHttp {
  get: HttpMethod;
  post: HttpMethod;
  put: HttpMethod;
  delete: HttpMethod;
  patch: HttpMethod;
  options: HttpMethod;
  head: HttpMethod;
  all: HttpMethod;
}

// 프리셋 저장소
const presetStore = new Map<string, Preset[]>();
const selectedPresetStore = new Map<
  string,
  { preset: Preset; override?: UseMockOptions['override'] }
>();

// http 객체를 Proxy로 래핑하여 확장
export const http = new Proxy(originalHttp as unknown as ExtendedHttp, {
  get(target, method: string) {
    const originalMethod = Reflect.get(originalHttp, method);
    if (typeof originalMethod !== 'function') {
      return originalMethod;
    }

    return (
      path: string,
      resolver: ResponseResolver<any, any>
    ): PresetHandler => {
      const wrappedResolver: typeof resolver = async (info) => {
        const selected = selectedPresetStore.get(path);

        if (selected) {
          let response = selected.preset.response;

          if (selected.override) {
            response = produce(response, (draft: any) => {
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

      const handler = originalMethod(path, wrappedResolver) as PresetHandler;

      // presets 메서드 직접 추가
      handler.presets = (...presets: Preset[]) => {
        if (presets.length > 0) {
          presetStore.set(path, presets);
        }
        return handler;
      };

      return handler;
    };
  },
});

// Helper function to extend handlers with preset functionality
export function extendHandlers(...handlers: HttpHandler[]): ExtendedHandlers {
  return {
    handlers,
    useMock(options: UseMockOptions) {
      const handler = handlers.find((h) => {
        const handlerPath = (h as any).info.path;
        const handlerMethod = (h as any).info.method;
        return handlerPath === options.path && handlerMethod === options.method;
      });

      if (!handler) {
        throw new Error(
          `No handler found for ${options.method} ${options.path}`
        );
      }

      const presets = presetStore.get(options.path);
      if (!presets) {
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
