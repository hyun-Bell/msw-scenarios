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
      server.use(...registeredHandlers);
    }
  },
  registerHandlers: (handlers: PresetHandler[]) => {
    registeredHandlers = handlers;
    if (currentInstance) {
      currentInstance.instance.resetHandlers();
      currentInstance.instance.use(...registeredHandlers);
    }
  },
  updateHandlers: () => {
    if (!currentInstance) return;

    const handlerStates = registeredHandlers.map((handler) => ({
      handler,
      state: mockingState.getEndpointState(
        handler._method,
        typeof handler._path === 'string'
          ? handler._path
          : handler._path.toString()
      ),
    }));

    // Only include handlers that are not set to use real API
    const activeHandlers = handlerStates
      .filter(({ state }) => state?.preset.label !== '__REAL_API__')
      .map(({ handler }) => handler);

    currentInstance.instance.resetHandlers();

    if (activeHandlers.length > 0) {
      currentInstance.instance.use(...activeHandlers);
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
