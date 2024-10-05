import { setupWorker, SetupWorker } from 'msw';
import { createMockManager } from './mockManager';
import { EndpointList, ScenarioList } from './types';

interface InitializeMocksProps<
  Endpoints extends EndpointList,
  Scenarios extends ScenarioList<Endpoints>,
> {
  endpoints: Endpoints;
  scenarios: Scenarios;
  worker?: SetupWorker;
}

/**
 * Initializes mocks using MSW and creates a mock manager.
 */
export function initializeMocks<
  Endpoints extends EndpointList,
  Scenarios extends ScenarioList<Endpoints>,
>({
  endpoints,
  scenarios,
  worker,
}: InitializeMocksProps<Endpoints, Scenarios>) {
  if (typeof window === 'undefined') {
    return { worker: null, mockManager: null };
  }

  const mswWorker = worker || setupWorker();

  const mockManager = createMockManager(mswWorker, endpoints, scenarios);

  return { worker: mswWorker, mockManager };
}
