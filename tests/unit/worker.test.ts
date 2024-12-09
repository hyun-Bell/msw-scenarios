import { HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { http, extendHandlers } from '../../src';
import { mockingState } from '../../src/mockingState';
import { workerManager } from '../../src/worker';

const server = setupServer();

describe('Worker MSW Integration Tests', () => {
  beforeAll(() => {
    workerManager.setupServer(server);
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    workerManager.resetHandlers();
    mockingState.resetAll();
  });

  afterAll(() => {
    server.close();
  });

  describe('MSW Handler Management', () => {
    it('should register handlers with MSW correctly', () => {
      const userHandler = http
        .get('http://localhost/api/users', () => {
          return HttpResponse.json({ message: 'default' });
        })
        .presets({
          label: 'test',
          status: 200,
          response: { data: 'test' },
        });

      const handlers = extendHandlers(userHandler);

      const registeredHandlers = server.listHandlers();
      expect(registeredHandlers).toHaveLength(1);
      expect(registeredHandlers[0]).toBe(handlers.handlers[0]);
    });

    it('should update MSW handlers when using mock', () => {
      const userHandler = http
        .get('http://localhost/api/users', () => {
          return HttpResponse.json({ message: 'default' });
        })
        .presets({
          label: 'test',
          status: 200,
          response: { data: 'test' },
        });

      const handlers = extendHandlers(userHandler);

      const initialHandlers = server.listHandlers();
      const initialCount = initialHandlers.length;

      handlers.useMock({
        method: 'get',
        path: 'http://localhost/api/users',
        preset: 'test',
      });

      const updatedHandlers = server.listHandlers();
      expect(updatedHandlers).toHaveLength(initialCount);
    });

    it('should handle multiple handler registrations correctly', () => {
      const userHandler = http
        .get('http://localhost/api/users', () => {
          return HttpResponse.json({ message: 'default users' });
        })
        .presets({
          label: 'test',
          status: 200,
          response: { data: 'test' },
        });

      const postHandler = http
        .get('http://localhost/api/posts', () => {
          return HttpResponse.json({ message: 'default posts' });
        })
        .presets({
          label: 'test',
          status: 200,
          response: { data: 'test' },
        });

      const handlers = extendHandlers(userHandler, postHandler);

      const registeredHandlers = server.listHandlers();
      expect(registeredHandlers).toHaveLength(2);

      handlers.useMock({
        method: 'get',
        path: 'http://localhost/api/users',
        preset: 'test',
      });

      handlers.useMock({
        method: 'get',
        path: 'http://localhost/api/posts',
        preset: 'test',
      });

      const updatedHandlers = server.listHandlers();
      expect(updatedHandlers).toHaveLength(2);
    });

    it('should maintain handler order in MSW', () => {
      const genericHandler = http
        .get('http://localhost/api/:type', () => {
          return HttpResponse.json({ type: 'generic' });
        })
        .presets({
          label: 'test',
          status: 200,
          response: { type: 'generic' },
        });

      const specificHandler = http
        .get('http://localhost/api/users', () => {
          return HttpResponse.json({ type: 'specific' });
        })
        .presets({
          label: 'test',
          status: 200,
          response: { type: 'specific' },
        });

      const handlers = extendHandlers(specificHandler, genericHandler);

      const registeredHandlers = server.listHandlers();
      expect(registeredHandlers[0]).toBe(handlers.handlers[0]);
      expect(registeredHandlers[1]).toBe(handlers.handlers[1]);
    });

    it('should use MSW server.use() when updating handlers', () => {
      const userHandler = http
        .get('http://localhost/api/users', () => {
          return HttpResponse.json({ message: 'default' });
        })
        .presets({
          label: 'test',
          status: 200,
          response: { data: 'test' },
        });

      const handlers = extendHandlers(userHandler);

      const useSpy = jest.spyOn(server, 'use');

      handlers.useMock({
        method: 'get',
        path: 'http://localhost/api/users',
        preset: 'test',
      });

      expect(useSpy).toHaveBeenCalled();
      useSpy.mockRestore();
    });
  });
});
