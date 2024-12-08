# msw-scenarios

<p align="center">
  <img src="https://github.com/user-attachments/assets/b67bbc6f-bb2b-46ec-8e4a-76652a777f04" alt="msw-scenarios Logo" width="400" style="border-radius: 15px;"/>
</p>

<div align="center">
  <a href="#installation">Installation</a> • 
  <a href="#key-features">Features</a> • 
  <a href="#usage">Usage</a> • 
  <a href="#api">API</a> • 
  <a href="#examples">Examples</a>
</div>

<br />

`msw-scenarios` is a **type-safe** preset management system built on top of [MSW (Mock Service Worker) 2.x.x](https://mswjs.io/). This library enhances MSW with a powerful preset system while maintaining complete TypeScript integration, ensuring that your API mocks are both flexible and type-safe during development and testing.

> This library was inspired by the presentation at WOOWACON 2023:  
> [프론트엔드 모킹 환경에 감칠맛 더하기](https://youtu.be/uiBCcmlJG4U?si=fZFCeQbxCCArA06a)

## ✨ Key Features

- **🔒 Enhanced Type Safety**: Built from the ground up with TypeScript
- **🔄 MSW Compatibility**: Works seamlessly with MSW 2.x.x
- **👥 Profile Management**: Create and switch between mock scenarios
- **🎮 UI Integration**: Build custom UI tools with state management API
- **🛠 Developer Friendly**: Simple, intuitive API design

## 📦 Installation

```bash
npm install msw-scenarios msw
# or
pnpm add msw-scenarios msw
# or
yarn add msw-scenarios msw
```

## 📚 Usage

### Basic Handler Setup

### Setting Up msw-scenarios

```typescript
import { extendHandlers } from 'msw-scenarios';
import { setupWorker } from 'msw';

const handlers = extendHandlers(userHandler);
const worker = setupWorker(...handlers.handlers);

// Register with workerManager
workerManager.setupWorker(worker);

// Start the worker
worker.start();
```

#### For Node.js

```typescript
import { setupServer } from 'msw/node';
import { workerManager } from 'msw-scenarios';
import { handlers } from './mocks/handlers';

// Create MSW server
const server = setupServer();

// Register with workerManager
workerManager.setupServer(server);

// Start the server in your test setup
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  workerManager.resetHandlers();
});

afterAll(() => {
  server.close();
});
```

### Using Presets

```typescript
handlers.useMock({
  method: 'get',
  path: '/api/user',
  preset: 'success',
  override: ({ data }) => {
    data.name = 'Jane'; // Modify response data
  },
});
```

### Using Profiles

```typescript
const profiles = handlers.createMockProfiles(
  {
    name: 'Empty State',
    actions: ({ useMock }) => {
      useMock({
        method: 'get',
        path: '/api/user',
        preset: 'success',
        override: ({ data }) => {
          data.name = 'New User';
        },
      });
    },
  },
  {
    name: 'Error State',
    actions: ({ useMock }) => {
      useMock({
        method: 'get',
        path: '/api/user',
        preset: 'error',
      });
    },
  }
);

// Apply profile
profiles.useMock('Empty State');
```

## 🎯 Advanced Examples

### Multiple Handlers with Type Safety

```typescript
import { http } from 'msw-scenarios';
import { HttpResponse } from 'msw';

// User handler
const userHandler = http
  .get('/api/user', () => {
    return HttpResponse.json({ message: 'default' });
  })
  .presets(
    {
      label: 'authenticated',
      status: 200,
      response: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin'
      }
    },
    {
      label: 'unauthorized',
      status: 401,
      response: {
        error: 'Unauthorized access'
      }
    }
  );

// Posts handler
const postsHandler = http
  .get('/api/posts', () => {
    return HttpResponse.json({ posts: [] });
  })
  .presets(
    {
      label: 'with-posts',
      status: 200,
      response: {
        posts: [
          { id: 1, title: 'First Post', content: 'Hello' },
          { id: 2, title: 'Second Post', content: 'World' }
        ],
        total: 2
      }
    },
    {
      label: 'empty',
      status: 200,
      response: { posts: [], total: 0 }
    }
  );

// Comments handler
const commentsHandler = http
  .get('/api/posts/:postId/comments', () => {
    return HttpResponse.json({ comments: [] });
  })
  .presets(
    {
      label: 'has-comments',
      status: 200,
      response: {
        comments: [
          { id: 1, text: 'Great post!', author: 'Jane' },
          { id: 2, text: 'Thanks!', author: 'John' }
        ]
      }
    },
    {
      label: 'no-comments',
      status: 200,
      response: { comments: [] }
    }
  );

// Combine all handlers
const handlers = extendHandlers(userHandler, postsHandler, commentsHandler);

// TypeScript provides excellent autocompletion and type checking:
handlers.useMock({
  method: 'get',      // ✨ Autocompletes with only available methods
  path: '/api/user',  // ✨ Autocompletes with only available paths
  preset: 'authenticated' // ✨ Autocompletes with only valid presets for this endpoint
  override: ({ data }) => {
    data.name = 'Jane Doe';  // ✨ TypeScript knows the shape of the response
    data.invalid = true;     // ❌ TypeScript Error: Property 'invalid' does not exist
  }
});

// Create comprehensive mocking profiles
const profiles = handlers.createMockProfiles(
  {
    name: 'Authenticated User with Content',
    actions: ({ useMock }) => {
      // ✨ Full type safety and autocompletion in profile actions
      useMock({
        method: 'get',
        path: '/api/user',
        preset: 'authenticated',
        override: ({ data }) => {
          data.name = 'Jane Doe'; // Type-safe override
        }
      });

      useMock({
        method: 'get',
        path: '/api/posts',
        preset: 'with-posts'
      });

      useMock({
        method: 'get',
        path: '/api/posts/:postId/comments',
        preset: 'has-comments'
      });
    }
  },
  {
    name: 'Unauthorized User',
    actions: ({ useMock, useRealAPI }) => {
      useMock({
        method: 'get',
        path: '/api/user',
        preset: 'unauthorized'
      });

      // Mix mock and real API calls
      useRealAPI({
        method: 'get',
        path: '/api/posts'  // ✨ Path autocomplete works here too
      });

      useMock({
        method: 'get',
        path: '/api/posts/:postId/comments',
        preset: 'no-comments'
      });
    }
  }
);

// Type-safe profile switching
profiles.useMock('Authenticated User with Content'); // ✨ Autocompletes available profile names
```

### Jest Test Examples

```typescript
import { HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { http, extendHandlers, workerManager } from 'msw-scenarios';

describe('API Mocking Tests', () => {
  // Setup MSW server
  const server = setupServer();

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

  it('should handle different API responses using presets', async () => {
    // Define handler with presets
    const userHandler = http
      .get('/api/user', () => {
        return HttpResponse.json({ message: 'default' });
      })
      .presets(
        {
          label: 'success',
          status: 200,
          response: { name: 'John', role: 'admin' },
        },
        {
          label: 'error',
          status: 404,
          response: { error: 'User not found' },
        }
      );

    // Create extended handlers
    const handlers = extendHandlers(userHandler);

    // Test success case
    handlers.useMock({
      method: 'get',
      path: '/api/user',
      preset: 'success',
    });

    let response = await fetch('/api/user');
    let data = await response.json();
    expect(data).toEqual({ name: 'John', role: 'admin' });

    // Test error case
    handlers.useMock({
      method: 'get',
      path: '/api/user',
      preset: 'error',
    });

    response = await fetch('/api/user');
    data = await response.json();
    expect(data).toEqual({ error: 'User not found' });
    expect(response.status).toBe(404);
  });

  it('should work with profiles for complex scenarios', async () => {
    const userHandler = http
      .get('/api/user', () => {
        return HttpResponse.json({ message: 'default' });
      })
      .presets(
        {
          label: 'authenticated',
          status: 200,
          response: { name: 'John', isAuthenticated: true },
        },
        {
          label: 'guest',
          status: 200,
          response: { name: 'Guest', isAuthenticated: false },
        }
      );

    const handlers = extendHandlers(userHandler);
    const profiles = handlers.createMockProfiles(
      {
        name: 'Authenticated User',
        actions: ({ useMock }) => {
          useMock({
            method: 'get',
            path: '/api/user',
            preset: 'authenticated',
          });
        },
      },
      {
        name: 'Guest User',
        actions: ({ useMock }) => {
          useMock({
            method: 'get',
            path: '/api/user',
            preset: 'guest',
          });
        },
      }
    );

    // Test authenticated profile
    profiles.useMock('Authenticated User');
    let response = await fetch('/api/user');
    let data = await response.json();
    expect(data.isAuthenticated).toBe(true);

    // Test guest profile
    profiles.useMock('Guest User');
    response = await fetch('/api/user');
    data = await response.json();
    expect(data.isAuthenticated).toBe(false);
  });
});
```

## 🎨 UI Integration

### State Management API

```typescript
import { mockingState } from 'msw-scenarios';

// Get current status
const status = mockingState.getCurrentStatus();

// Subscribe to changes
const unsubscribe = mockingState.subscribeToChanges(
  ({ mockingStatus, currentProfile }) => {
    console.log('Status:', mockingStatus);
    console.log('Profile:', currentProfile);
  }
);

// Control mocks
mockingState.resetEndpoint('get', '/api/user');
mockingState.resetAll();
```

### React Integration Example

```tsx
import { useEffect, useState } from 'react';
import { mockingState } from 'msw-scenarios';
import type { MockingStatus } from 'msw-scenarios';

function MockingController({ handlers, profiles }) {
  const [status, setStatus] = useState<MockingStatus[]>([]);
  const [currentProfile, setCurrentProfile] = useState<string | null>(null);

  useEffect(() => {
    return mockingState.subscribeToChanges(
      ({ mockingStatus, currentProfile }) => {
        setStatus(mockingStatus);
        setCurrentProfile(currentProfile);
      }
    );
  }, []);

  return (
    <div className="mocking-controller">
      {/* Profile Selector */}
      <div>
        <h3>Profiles</h3>
        <select
          value={currentProfile ?? ''}
          onChange={(e) => profiles.useMock(e.target.value)}
        >
          <option value="">No Profile</option>
          {profiles.getAvailableProfiles().map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Endpoint Controls */}
      <div>
        <h3>Endpoints</h3>
        {status.map(({ method, path, currentPreset }) => (
          <div key={`${method}-${path}`} className="endpoint-control">
            <div>
              {method.toUpperCase()} {path}
            </div>
            <div>
              <select
                value={currentPreset ?? ''}
                onChange={(e) => {
                  if (e.target.value === '') {
                    handlers.useRealAPI({ method, path });
                  } else {
                    handlers.useMock({
                      method,
                      path,
                      preset: e.target.value,
                    });
                  }
                }}
              >
                <option value="">Real API</option>
                {handlers.handlers
                  .find((h) => h._method === method && h._path === path)
                  ?._presets.map((preset) => (
                    <option key={preset.label} value={preset.label}>
                      {preset.label}
                    </option>
                  ))}
              </select>
              <button onClick={() => mockingState.resetEndpoint(method, path)}>
                Reset
              </button>
            </div>
          </div>
        ))}
        <button onClick={mockingState.resetAll}>Reset All</button>
      </div>
    </div>
  );
}
```

## 📝 Types

The library provides full TypeScript support with the following key types:

```typescript
interface MockingState {
  getCurrentStatus: () => Array<MockingStatus>;
  getCurrentProfile: <Name extends string = string>() => Name | null;
  subscribeToChanges: <Name extends string = string>(
    callback: (state: {
      mockingStatus: Array<MockingStatus>;
      currentProfile: Name | null;
    }) => void
  ) => () => void;
  resetAll: () => void;
  resetEndpoint: (method: string, path: string) => void;
  getEndpointState: (
    method: string,
    path: string
  ) => SelectedPreset | undefined;
  setCurrentProfile: <Name extends string = string>(
    profileName: Name | null
  ) => void;
}
```

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
