import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';
import { workerManager } from '@/src/worker';

export const worker = setupWorker(...handlers.handlers);
workerManager.setupWorker(worker);
