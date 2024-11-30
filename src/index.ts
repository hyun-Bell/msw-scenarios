import {
  HttpHandler,
  HttpResponse,
  DefaultBodyType,
  http as originalHttp,
  RequestHandler,
} from 'msw';

// Preset 타입 정의
export interface Preset {
  label: string;
  status: number;
  response: any;
}

// 확장된 핸들러 인터페이스
export interface PresetHandler extends RequestHandler {
  presets: (...presets: Preset[]) => PresetHandler;
}

type HttpMethods = keyof typeof originalHttp;

// 확장된 HTTP 타입
export type ExtendedHttp = Record<
  HttpMethods,
  (
    path: string,
    resolver: (req: Request) => Promise<HttpResponse> | HttpResponse
  ) => PresetHandler
>;

// 프리셋 저장소
const presetStore = new Map<string, Preset[]>();
const selectedPresetStore = new Map<string, number>();

// http 객체를 Proxy로 래핑하여 확장
export const http: ExtendedHttp = new Proxy(originalHttp, {
  get(target, method: string) {
    const originalMethod = Reflect.get(target, method);
    if (typeof originalMethod !== 'function') {
      return originalMethod;
    }

    return (
      path: string,
      resolver: (req: Request) => Promise<HttpResponse> | HttpResponse
    ): PresetHandler => {
      const wrappedResolver = async (req: Request) => {
        const presets = presetStore.get(path);
        const selectedIndex = selectedPresetStore.get(path);

        if (presets && selectedIndex !== undefined && selectedIndex >= 0) {
          const selectedPreset = presets[selectedIndex];
          return new HttpResponse(JSON.stringify(selectedPreset.response), {
            status: selectedPreset.status,
            headers: {
              'Content-Type': 'application/json',
            },
          });
        }

        return resolver(req);
      };

      const originalHandler = originalMethod(path, wrappedResolver);

      const extendedHandler = new Proxy(originalHandler as unknown as object, {
        get(handlerTarget, prop: string) {
          if (prop === 'presets') {
            return (...presets: Preset[]): PresetHandler => {
              if (presets.length > 0) {
                presetStore.set(path, presets);
              }
              return extendedHandler;
            };
          }
          return Reflect.get(handlerTarget, prop);
        },
      }) as PresetHandler;

      return extendedHandler;
    };
  },
}) as unknown as ExtendedHttp;

export function selectPreset(path: string, index: number | null) {
  if (index === null) {
    selectedPresetStore.delete(path);
    return;
  }

  const presets = presetStore.get(path);
  if (presets && index >= 0 && index < presets.length) {
    selectedPresetStore.set(path, index);
  }
}

export function getPresetsState() {
  const state: Record<
    string,
    {
      presets: Preset[] | undefined;
      selectedIndex: number | undefined;
    }
  > = {};

  for (const [path, presets] of presetStore.entries()) {
    state[path] = {
      presets,
      selectedIndex: selectedPresetStore.get(path),
    };
  }

  return state;
}

export function extendHandlers<T extends HttpHandler[]>(handlers: T): T {
  return handlers;
}
