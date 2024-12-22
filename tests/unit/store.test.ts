import { HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { extendHandlers, http } from '../../src';
import { presetStore } from '../../src/store/stores';
import { workerManager } from '../../src/worker';

const server = setupServer();

describe('Store Management Tests', () => {
  beforeAll(() => {
    workerManager.setupServer(server);
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    workerManager.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  describe('Preset Store Management', () => {
    it('should properly store and maintain multiple presets', () => {
      const userHandler = http
        .get('http://localhost/api/users', () => {
          return HttpResponse.json({ message: 'default 2' });
        })
        .presets(
          {
            label: 'empty',
            status: 200,
            response: { users: [] },
          },
          {
            label: 'withUsers',
            status: 200,
            response: { users: [{ id: 1, name: 'John' }] },
          }
        );

      const handlers = extendHandlers(userHandler);

      const initialPresets =
        presetStore.getState().presets['http://localhost/api/users'];
      expect(initialPresets).toHaveLength(3); // Including default preset
      expect(initialPresets[0].label).toBe('default');
      expect(initialPresets[1].label).toBe('empty');
      expect(initialPresets[2].label).toBe('withUsers');
    });

    it('should handle multiple handlers with different presets', () => {
      const userHandler = http
        .get('http://localhost/api/users', () => {
          return HttpResponse.json({ message: 'default' });
        })
        .presets(
          {
            label: 'empty',
            status: 200,
            response: { users: [] },
          },
          {
            label: 'withUsers',
            status: 200,
            response: { users: [{ id: 1, name: 'John' }] },
          }
        );

      const postHandler = http
        .get('http://localhost/api/posts', () => {
          return HttpResponse.json({ message: 'default' });
        })
        .presets(
          {
            label: 'noPosts',
            status: 200,
            response: { posts: [] },
          },
          {
            label: 'withPosts',
            status: 200,
            response: { posts: [{ id: 1, title: 'Post 1' }] },
          }
        );

      const handlers = extendHandlers(userHandler, postHandler);

      const presets = presetStore.getState().presets;
      expect(Object.keys(presets)).toHaveLength(2);
      expect(presets['http://localhost/api/users']).toHaveLength(3); // Including default preset
      expect(presets['http://localhost/api/posts']).toHaveLength(3); // Including default preset
    });
  });
});
