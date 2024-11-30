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

```typescript
import { http } from 'msw-scenarios';
import { HttpResponse } from 'msw';

const userHandler = http
  .get('/api/user', () => {
    return HttpResponse.json({ message: 'default' });
  })
  .presets(
    {
      label: 'success',
      status: 200,
      response: { name: 'John', age: 30 },
    },
    {
      label: 'error',
      status: 404,
      response: { error: 'Not found' },
    }
  );
```

### Setting Up Handlers

```typescript
import { extendHandlers } from 'msw-scenarios';
import { setupWorker } from 'msw';

const handlers = extendHandlers(userHandler);
const worker = setupWorker(...handlers.handlers);

worker.start();
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
