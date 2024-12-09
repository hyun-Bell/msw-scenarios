import { HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { http, extendHandlers } from '..';
import { mockingState } from '../mockingState';
import { presetStore, selectedPresetStore } from '../store/stores';
import { workerManager } from '../worker';

const server = setupServer();

describe('Store Management Tests', () => {
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

  describe('Preset Store Management', () => {
    it('should properly store and maintain multiple presets', () => {
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

      const handlers = extendHandlers(userHandler);

      const initialPresets =
        presetStore.getState().presets['http://localhost/api/users'];
      expect(initialPresets).toHaveLength(2);
      expect(initialPresets[0].label).toBe('empty');
      expect(initialPresets[1].label).toBe('withUsers');
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
      expect(presets['http://localhost/api/users']).toHaveLength(2);
      expect(presets['http://localhost/api/posts']).toHaveLength(2);
    });
  });

  describe('Selected Preset Store Management', () => {
    it('should properly manage selected presets', () => {
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

      const handlers = extendHandlers(userHandler);

      expect(selectedPresetStore.getState().selected).toEqual({});

      handlers.useMock({
        method: 'get',
        path: 'http://localhost/api/users',
        preset: 'empty',
      });

      const selectedState = selectedPresetStore.getState().selected;
      expect(Object.keys(selectedState)).toHaveLength(1);
      expect(selectedState['get:http://localhost/api/users'].preset.label).toBe(
        'empty'
      );

      handlers.useMock({
        method: 'get',
        path: 'http://localhost/api/users',
        preset: 'withUsers',
      });

      const updatedState = selectedPresetStore.getState().selected;
      expect(updatedState['get:http://localhost/api/users'].preset.label).toBe(
        'withUsers'
      );
    });

    it('should handle preset override correctly', () => {
      const userHandler = http
        .get('http://localhost/api/users', () => {
          return HttpResponse.json({ message: 'default' });
        })
        .presets({
          label: 'withUsers',
          status: 200,
          response: { users: [{ id: 1, name: 'John' }] },
        });

      const handlers = extendHandlers(userHandler);

      handlers.useMock({
        method: 'get',
        path: 'http://localhost/api/users',
        preset: 'withUsers',
        override: ({ data }) => {
          data.users.push({ id: 2, name: 'Jane' });
        },
      });

      const selectedState = selectedPresetStore.getState().selected;
      const selectedPreset = selectedState['get:http://localhost/api/users'];
      expect(selectedPreset.override).toBeDefined();
    });
  });

  describe('Store Reset Functionality', () => {
    it('should properly reset all stores', () => {
      const userHandler = http
        .get('http://localhost/api/users', () => {
          return HttpResponse.json({ message: 'default' });
        })
        .presets({
          label: 'empty',
          status: 200,
          response: { users: [] },
        });

      const handlers = extendHandlers(userHandler);

      handlers.useMock({
        method: 'get',
        path: 'http://localhost/api/users',
        preset: 'empty',
      });

      mockingState.resetAll();

      expect(presetStore.getState().presets).toEqual({});
      expect(selectedPresetStore.getState().selected).toEqual({});
      expect(selectedPresetStore.getState().currentProfile).toBeNull();
    });

    it('should reset individual endpoints', () => {
      const userHandler = http
        .get('http://localhost/api/users', () => {
          return HttpResponse.json({ message: 'default' });
        })
        .presets({
          label: 'empty',
          status: 200,
          response: { users: [] },
        });

      const handlers = extendHandlers(userHandler);

      handlers.useMock({
        method: 'get',
        path: 'http://localhost/api/users',
        preset: 'empty',
      });

      mockingState.resetEndpoint('get', 'http://localhost/api/users');

      const selectedState = selectedPresetStore.getState().selected;
      expect(selectedState['get:http://localhost/api/users']).toBeUndefined();
    });
  });
});
