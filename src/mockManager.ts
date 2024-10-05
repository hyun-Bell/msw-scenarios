import {
  DefaultBodyType,
  MockedRequest,
  ResponseResolver,
  rest,
  RestContext,
  RestHandler,
  SetupWorker,
} from 'msw';
import {
  Action,
  EndpointFor,
  EndpointList,
  HttpMethod,
  MockManagerAPI,
  PresetsFor,
  Scenario,
  ScenarioList,
  ValidMethods,
  ValidPathsForMethod,
} from './types';

/* ============================= */
/*       MockManager Class       */
/* ============================= */

export class MockManager<Endpoints extends EndpointList> {
  private endpoints: Endpoints;
  private worker: SetupWorker;
  private scenarioHandlers: Map<string, RestHandler[]> = new Map();
  private methodPathToHandlers: Map<string, RestHandler[]> = new Map();

  constructor(worker: SetupWorker, endpoints: Endpoints) {
    this.worker = worker;
    this.endpoints = endpoints;
  }

  /** Use Mock Handler */
  useMock<
    M extends ValidMethods<Endpoints>,
    P extends ValidPathsForMethod<Endpoints, M>,
    Preset extends PresetsFor<Endpoints, M, P>,
  >(config: { method: M; path: P; preset: Preset }) {
    const handler = this.createMockHandler(config);
    this.worker.use(handler);
    this.addHandlerToMap(config.method, config.path, handler);
  }

  /** Use Real API */
  useRealAPI<
    M extends ValidMethods<Endpoints>,
    P extends ValidPathsForMethod<Endpoints, M>,
  >(config: { method: M; path: P }) {
    const key = this.generateKey(config.method, config.path);
    const handlers = this.methodPathToHandlers.get(key);
    if (handlers && handlers.length > 0) {
      this.worker.resetHandlers(...handlers);
      this.methodPathToHandlers.delete(key);
    }
  }

  /** Create Scenario Profiles */
  createMockProfiles(scenarios: Scenario<Endpoints>[]) {
    const scenarioMap = new Map<string, () => void>();

    scenarios.forEach((scenario) => {
      scenarioMap.set(scenario.name, () => {
        const scenarioHandlers: RestHandler[] = [];
        const action: Action<Endpoints> = {
          useMock: (config) => {
            const handler = this.createMockHandler(config);
            scenarioHandlers.push(handler);
            this.addHandlerToMap(config.method, config.path, handler);
          },
          useRealAPI: (config) => {
            this.useRealAPI(config);
          },
        };
        scenario.actions(action);
        this.scenarioHandlers.set(scenario.name, scenarioHandlers);
        this.worker.use(...scenarioHandlers);
      });
    });

    return {
      applyScenario: (name: string) => {
        const apply = scenarioMap.get(name);
        if (!apply) {
          throw new Error(`Scenario '${name}' not found.`);
        }
        apply();
      },
      removeScenario: (name: string) => {
        const handlers = this.scenarioHandlers.get(name);
        if (handlers) {
          this.worker.resetHandlers(...handlers);
          this.scenarioHandlers.delete(name);
          handlers.forEach((handler) => this.removeHandlerFromMap(handler));
        }
      },
    };
  }

  /** Create Mock Handler */
  private createMockHandler<
    M extends ValidMethods<Endpoints>,
    P extends ValidPathsForMethod<Endpoints, M>,
    Preset extends PresetsFor<Endpoints, M, P>,
  >(config: { method: M; path: P; preset: Preset }): RestHandler {
    const endpoint = this.endpoints.find(
      (ep) => ep.method === config.method && ep.path === config.path
    );

    if (!endpoint) {
      throw new Error(`Endpoint ${config.method} ${config.path} not found.`);
    }

    const endpointTyped = endpoint as EndpointFor<Endpoints, M, P>;

    const presetResponse = endpointTyped.presets[config.preset as string];
    if (!presetResponse) {
      throw new Error(
        `Preset '${String(config.preset)}' not found for endpoint ${config.method} ${config.path}.`
      );
    }

    const methodLower = config.method.toLowerCase() as Lowercase<HttpMethod>;
    const path: string | RegExp = config.path;

    const restMethod = rest[methodLower] as (
      path: string | RegExp,
      resolver: ResponseResolver<MockedRequest<DefaultBodyType>, RestContext>
    ) => RestHandler;

    return restMethod(path, presetResponse);
  }

  private addHandlerToMap(
    method: HttpMethod,
    path: string | RegExp,
    handler: RestHandler
  ) {
    const key = this.generateKey(method, path);
    if (!this.methodPathToHandlers.has(key)) {
      this.methodPathToHandlers.set(key, []);
    }
    this.methodPathToHandlers.get(key)?.push(handler);
  }

  private removeHandlerFromMap(handler: RestHandler) {
    const method = handler.info.method as HttpMethod;
    const path = handler.info.path;
    const key = this.generateKey(method, path);
    const existingHandlers = this.methodPathToHandlers.get(key);
    if (existingHandlers) {
      const index = existingHandlers.indexOf(handler);
      if (index !== -1) {
        existingHandlers.splice(index, 1);
        if (existingHandlers.length === 0) {
          this.methodPathToHandlers.delete(key);
        } else {
          this.methodPathToHandlers.set(key, existingHandlers);
        }
      }
    }
  }

  private generateKey(method: HttpMethod, path: string | RegExp): string {
    return `${method}-${path.toString()}`;
  }
}

/* ============================= */
/*    MockManager Factory        */
/* ============================= */

/**
 * Creates a MockManager instance and returns its API.
 */
export function createMockManager<
  Endpoints extends EndpointList,
  Scenarios extends ScenarioList<Endpoints>,
>(
  worker: SetupWorker,
  endpoints: Endpoints,
  scenarios: Scenarios
): MockManagerAPI<Endpoints, Scenarios> {
  const instance = new MockManager(worker, endpoints);

  const mockProfiles = instance.createMockProfiles([...scenarios]);

  return {
    useMock: instance.useMock.bind(instance),
    useRealAPI: instance.useRealAPI.bind(instance),
    applyScenario: mockProfiles.applyScenario,
    removeScenario: mockProfiles.removeScenario,
  };
}
