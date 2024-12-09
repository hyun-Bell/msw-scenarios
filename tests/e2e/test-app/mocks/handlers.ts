import { http } from '@/src';
import { extendHandlers } from '@/src';
import { HttpResponse } from 'msw';

const userHandler = http
  .get('/api/users', () => {
    return HttpResponse.json({ message: 'default users' });
  })
  .presets(
    {
      label: 'emptyUsers',
      status: 200,
      response: { users: [] },
    },
    {
      label: 'withUsers',
      status: 200,
      response: {
        users: [
          { id: 1, name: 'John', role: 'admin', email: 'john@example.com' },
          { id: 2, name: 'Jane', role: 'user', email: 'jane@example.com' },
        ],
      },
    },
    {
      label: 'error',
      status: 500,
      response: {
        error: 'Failed to fetch users',
      },
    }
  );

const authHandler = http
  .post('/api/login', () => {
    return HttpResponse.json({ message: 'default login' });
  })
  .presets(
    {
      label: 'success',
      status: 200,
      response: {
        token: 'mock-jwt-token',
        user: { id: 1, name: 'John', role: 'admin' },
      },
    },
    {
      label: 'invalidCredentials',
      status: 401,
      response: {
        error: 'Invalid credentials',
      },
    }
  );

export const handlers = extendHandlers(userHandler, authHandler);
