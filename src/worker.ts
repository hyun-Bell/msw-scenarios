import { SetupWorker } from 'msw/lib/browser';
import { SetupServerApi } from 'msw/lib/node';
import { PresetHandler } from './types';
import { mockingState } from './mockingState';
type Instance =
  | {
      type: 'browser';
      instance: SetupWorker;
    }
  | {
      type: 'node';
      instance: SetupServerApi;
    }
  | null;

let currentInstance: Instance = null;
let registeredHandlers: PresetHandler[] = [];

export const workerManager = {
  setupWorker: (worker: SetupWorker) => {
    currentInstance = {
      type: 'browser',
      instance: worker,
    };
    if (registeredHandlers.length > 0) {
      worker.use(...registeredHandlers);
    }
  },
  setupServer: (server: SetupServerApi) => {
    currentInstance = {
      type: 'node',
      instance: server,
    };
    if (registeredHandlers.length > 0) {
      server.resetHandlers(...registeredHandlers);
    }
  },
  registerHandlers: (handlers: PresetHandler[]) => {
    registeredHandlers = handlers;
    if (currentInstance) {
      if (currentInstance.type === 'browser') {
        currentInstance.instance.use(...registeredHandlers);
      } else {
        currentInstance.instance.resetHandlers(...registeredHandlers);
      }
    }
  },
  updateHandlers: () => {
    if (!currentInstance) return;

    // 모든 핸들러에 대해 프리셋 상태를 확인하고 적절한 핸들러를 생성
    const updatedHandlers = registeredHandlers.map((handler) => {
      const state = mockingState.getEndpointState(
        handler._method,
        handler._path
      );

      if (state) {
        // 프리셋이 있으면 해당 프리셋으로 새 핸들러 생성
        const presetHandlers = handler.presets(state.preset as any);
        return Array.isArray(presetHandlers) ? presetHandlers[0] : handler;
      }
      return handler;
    });

    if (currentInstance.type === 'browser') {
      currentInstance.instance.use(...updatedHandlers);
    } else {
      currentInstance.instance.resetHandlers(...updatedHandlers);
    }
  },
  resetHandlers: () => {
    if (currentInstance) {
      registeredHandlers = [];
      currentInstance.instance.resetHandlers();
      mockingState.resetAll();
    }
  },
  getInstance: () => currentInstance?.instance ?? null,
  getInstanceType: () => currentInstance?.type ?? null,
};
