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

    const activeHandlers = registeredHandlers.filter((handler) => {
      const state = mockingState.getEndpointState(
        handler._method,
        handler._path
      );
      return state === undefined;
    });

    if (currentInstance.type === 'browser') {
      currentInstance.instance.use(...activeHandlers);
    } else {
      currentInstance.instance.resetHandlers(...activeHandlers);
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
