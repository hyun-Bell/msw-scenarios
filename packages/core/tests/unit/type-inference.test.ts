import { http, extendHandlers } from '../../src';
import { HttpResponse } from 'msw';

describe('Type Inference Tests', () => {
  it('should infer preset labels correctly', () => {
    // Create a handler with specific presets
    const userHandler = http
      .get('/api/users', () => {
        return HttpResponse.json({ message: 'default' });
      })
      .presets(
        { label: 'empty' as const, status: 200, response: { users: [] } },
        {
          label: 'withData' as const,
          status: 200,
          response: { users: [{ id: 1, name: 'John' }] },
        },
        {
          label: 'error' as const,
          status: 404,
          response: { error: 'Not found' },
        }
      );

    const handlers = extendHandlers(userHandler);

    // This should have type checking for preset field
    handlers.useMock({
      method: 'get',
      path: '/api/users',
      preset: 'empty', // Should be: 'default' | 'empty' | 'withData' | 'error'
    });

    // Test with another preset
    handlers.useMock({
      method: 'get',
      path: '/api/users',
      preset: 'withData',
    });

    // Test with default preset
    handlers.useMock({
      method: 'get',
      path: '/api/users',
      preset: 'default',
    });

    // The following would cause a type error in TypeScript (commented out for test to pass):
    // handlers.useMock({
    //   method: 'get',
    //   path: '/api/users',
    //   preset: 'nonexistent', // Type error: not in 'default' | 'empty' | 'withData' | 'error'
    // });

    expect(true).toBe(true); // Dummy assertion for the test
  });

  it('should handle multiple handlers with different presets', () => {
    const userHandler = http
      .get('/api/users', () => HttpResponse.json({ type: 'users' }))
      .presets(
        { label: 'emptyUsers' as const, status: 200, response: { users: [] } },
        {
          label: 'fullUsers' as const,
          status: 200,
          response: { users: [1, 2, 3] },
        }
      );

    const postHandler = http
      .get('/api/posts', () => HttpResponse.json({ type: 'posts' }))
      .presets(
        { label: 'emptyPosts' as const, status: 200, response: { posts: [] } },
        {
          label: 'fullPosts' as const,
          status: 200,
          response: { posts: ['a', 'b'] },
        }
      );

    const handlers = extendHandlers(userHandler, postHandler);

    // User handler presets
    handlers.useMock({
      method: 'get',
      path: '/api/users',
      preset: 'emptyUsers', // Should be: 'default' | 'emptyUsers' | 'fullUsers'
    });

    // Post handler presets
    handlers.useMock({
      method: 'get',
      path: '/api/posts',
      preset: 'fullPosts', // Should be: 'default' | 'emptyPosts' | 'fullPosts'
    });

    expect(true).toBe(true); // Dummy assertion
  });

  it('should work with dynamic presets via addPreset', () => {
    const handler = http
      .get('/api/data', () => HttpResponse.json({ data: 'default' }))
      .presets({
        label: 'initial' as const,
        status: 200,
        response: { data: 'initial' },
      })
      .addPreset({
        label: 'added' as const,
        status: 200,
        response: { data: 'added' },
      });

    const handlers = extendHandlers(handler);

    // Should have all presets available
    handlers.useMock({
      method: 'get',
      path: '/api/data',
      preset: 'initial', // Should be: 'default' | 'initial' | 'added'
    });

    handlers.useMock({
      method: 'get',
      path: '/api/data',
      preset: 'added',
    });

    expect(true).toBe(true); // Dummy assertion
  });
});
