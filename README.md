# msw-scenarios

<p align="center">
  <img src="https://github.com/user-attachments/assets/b67bbc6f-bb2b-46ec-8e4a-76652a777f04" alt="msw-scenarios Logo" width="400" style="border-radius: 15px;"/>
</p>

`msw-scenarios` is a **type-safe**, scenario-based mocking library built on top of [MSW (Mock Service Worker)](https://mswjs.io/). This library allows you to safely manage and switch between API responses based on predefined scenarios with full TypeScript support, ensuring that only valid scenarios and presets are used during development and testing.

> This package was created after watching the WOOWACON 2023 video.  
> [프론트엔드 모킹 환경에 감칠맛 더하기](https://youtu.be/uiBCcmlJG4U?si=fZFCeQbxCCArA06a)

## Key Features and Benefits

- **Scenario-based Mocking**: Easily define and switch between multiple API scenarios.
- **Flexible API Response Management**: Seamlessly manage and switch API responses during development or testing.
- **Type Guard Enforcement**: Ensures that only valid presets and scenarios are used, preventing runtime errors.
- **Seamless Integration with MSW**: Works effortlessly with MSW for mocking API requests.
- **Smooth Transition Between Mock and Real APIs**: Toggle between mocked and real API responses without any friction.

## Required Packages

Before using `msw-scenarios`, ensure you have the following installed:

- **Node.js**: v14 or later
- **pnpm** (recommended) or **npm**
- **msw**: The core package for API mocking.

## Installation

You can install `msw-scenarios` using either `pnpm` or `npm`:

```bash
pnpm add msw-scenarios msw
# or
npm install msw-scenarios msw
```


## Usage

### Defining API Endpoints and Scenarios
Start by defining the API endpoints you want to mock along with the preset responses for each scenario. Then, define various scenarios for these endpoints.

```typescript
import { EndpointDefinition } from 'msw-scenarios';

export const endpoints: EndpointDefinition[] = [
  {
    method: 'GET',
    path: '/api/users',
    presets: {
      'Default Response': (req, res, ctx) =>
        res(ctx.json({ users: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }] })),
      'Empty Response': (req, res, ctx) => res(ctx.json({ users: [] })),
    },
  },
  {
    method: 'POST',
    path: '/api/users',
    presets: {
      'Create User Success': (req, res, ctx) =>
        res(ctx.status(201), ctx.json({ id: 3, name: 'Charlie' })),
      'Create User Failure': (req, res, ctx) =>
        res(ctx.status(400), ctx.json({ error: 'User creation failed' })),
    },
  },
];
```


### Defining Scenarios
Next, define the scenarios for the above endpoints. Each scenario maps to a specific API response.


```typescript
import { Scenario } from 'msw-scenarios';
import { endpoints } from './endpoints';

export const scenarios: Scenario<typeof endpoints>[] = [
  {
    name: 'Get Default Users',
    actions: (action) => {
      action.useMock({
        method: 'GET',
        path: '/api/users',
        preset: 'Default Response',
      });
    },
  },
  {
    name: 'Get Empty Users',
    actions: (action) => {
      action.useMock({
        method: 'GET',
        path: '/api/users',
        preset: 'Empty Response',
      });
    },
  },
  {
    name: 'Create User Success',
    actions: (action) => {
      action.useMock({
        method: 'POST',
        path: '/api/users',
        preset: 'Create User Success',
      });
    },
  },
  {
    name: 'Create User Failure',
    actions: (action) => {
      action.useMock({
        method: 'POST',
        path: '/api/users',
        preset: 'Create User Failure',
      });
    },
  },
];
```

### Type Guard: Preventing Invalid Scenarios and Presets
#### One of the strengths of msw-scenarios is its built-in type guard feature, ensuring that only valid presets and scenario names can be used.

Here’s an example:
```typescript
mockManager.applyScenario('Get Default Users'); // ✅ Valid scenario
mockManager.applyScenario('Invalid Scenario'); // ❌ TypeScript error: Argument of type '"Invalid Scenario"' is not assignable.
```

Similarly, when you define presets for an endpoint, TypeScript will enforce the use of only valid presets:
```typescript
mockManager.useMock({
    method: 'GET',
    path: '/api/users',
    preset: 'Default Response', // ✅ Valid preset
});

mockManager.useMock({
    method: 'GET',
    path: '/api/users',
    preset: 'Invalid Response', // ❌ TypeScript error: '"Invalid Response"' is not assignable to type.
});
````
These type guards help catch errors during development, ensuring that invalid scenarios or presets do not slip through into production or cause unexpected runtime errors.

### Initializing Mocking in Your Application
Now, initialize the mock service worker and apply the scenarios in your application.

```typescript
// mockSetup.ts
import { initializeMocks } from 'msw-scenarios';
import { endpoints } from './endpoints';
import { scenarios } from './scenarios';

const { mockManager, worker } = initializeMocks({
  endpoints,
  scenarios,
});

worker.start({
  onUnhandledRequest: 'bypass', // Allows unhandled requests to pass through.
  waitUntilReady: true,
});

// Apply the desired scenario
mockManager.applyScenario('Get Default Users');
```

### Applying Different Scenarios
You can easily switch between different API scenarios depending on your testing or development needs:

```typescript
// Switch to a different scenario
mockManager.applyScenario('Create User Success');

// To reset the scenario, you can switch back or use the real API
mockManager.applyScenario('Get Default Users');
```

### Using Real APIs
If you need to use the real API for a specific route, you can do so dynamically:

```typescript
mockManager.useRealAPI({
  method: 'GET',
  path: '/api/users',
});
```

## Using in Tests
You can also use `msw-scenarios` in your test environment to mock API responses based on scenarios. This allows for isolated and predictable tests.
```typescript
// setupTests.ts
import { initializeMocks } from 'msw-scenarios';
import { endpoints } from './endpoints';
import { scenarios } from './scenarios';

const { mockManager, worker } = initializeMocks({
  endpoints,
  scenarios,
});

beforeAll(() => worker.start());
afterEach(() => worker.resetHandlers());
afterAll(() => worker.stop());

// Apply a specific scenario before running a test
export const applyScenario = mockManager.applyScenario;
```

```typescript
// user.test.ts
import { applyScenario } from './setupTests';

test('should fetch the default list of users', async () => {
  applyScenario('Get Default Users');
  
  const response = await fetch('/api/users');
  const data = await response.json();

  expect(data).toEqual({
    users: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }],
  });
});

test('should fetch an empty list of users', async () => {
  applyScenario('Get Empty Users');
  
  const response = await fetch('/api/users');
  const data = await response.json();

  expect(data).toEqual({ users: [] });
});
```



## Advantages
Scenario Flexibility: Define multiple scenarios and toggle between them to test different API behaviors in your application.
Improved Development Workflow: Mock APIs even when the backend is not available, or switch between mock and real APIs during development.
Easier Testing: Quickly set up different API responses for unit tests, integration tests, or user flows.
Seamless API Switching: Switch between mocked and real API responses without changing application code, ensuring a smoother development and debugging process.

## License
This project is licensed under the MIT License.
