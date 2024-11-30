# msw-scenarios

<p align="center">
  <img src="https://github.com/user-attachments/assets/b67bbc6f-bb2b-46ec-8e4a-76652a777f04" alt="msw-scenarios Logo" width="400" style="border-radius: 15px;"/>
</p>

`msw-scenarios` is a **type-safe** preset management system built on top of [MSW (Mock Service Worker) 2.x.x](https://mswjs.io/). This library enhances MSW with a powerful preset system while maintaining complete TypeScript integration, ensuring that your API mocks are both flexible and type-safe during development and testing.

> This library was inspired by the presentation at WOOWACON 2023:  
> [프론트엔드 모킹 환경에 감칠맛 더하기](https://youtu.be/uiBCcmlJG4U?si=fZFCeQbxCCArA06a)

## Key Features and Benefits

- **Enhanced Type Safety**: Built from the ground up with TypeScript, ensuring type safety across all your mocks
- **MSW Compatibility**: Works with all MSW features while adding preset management capabilities
- **Developer Friendly**: Simple, intuitive API that makes mock management easier
- **Flexible Mocking**: Easily switch between different response scenarios during development and testing
- **Production Ready**: Used in real-world applications with proven reliability

## Installation

```bash
npm install msw-scenarios msw
# or
pnpm add msw-scenarios msw
# or
yarn add msw-scenarios msw
```

## Basic Usage

### 1. Define Your Handlers with Presets

```typescript
import { http } from 'msw-scenarios';
import { HttpResponse } from 'msw';

// Define a handler with presets
const userHandler = http
  .get('/api/user', () => {
    return HttpResponse.json({ message: 'default response' });
  })
  .presets(
    {
      label: 'success',
      status: 200,
      response: { name: 'John Doe', age: 30 },
    },
    {
      label: 'error',
      status: 404,
      response: { error: 'User not found' },
    }
  );
```

### 2. Set Up Your Handlers

```typescript
import { extendHandlers } from 'msw-scenarios';
import { setupWorker } from 'msw';

const userHandlers = extendHandlers(userHandler);
const worker = setupWorker(...userHandlers.handlers);

worker.start();
```

### 3. Use Different Presets

```typescript
// Switch to success preset
userHandlers.useMock({
  method: 'get',
  path: '/api/user',
  preset: 'success',
});

// Switch to error preset
userHandlers.useMock({
  method: 'get',
  path: '/api/user',
  preset: 'error',
});
```

### 4. Dynamic Response Override

```typescript
userHandlers.useMock({
  method: 'get',
  path: '/api/user',
  preset: 'success',
  override: ({ data }) => {
    data.name = 'Jane Doe'; // Modify the response data
  },
});
```

## Type Safety Features

### Preset Label Type Safety

TypeScript will ensure you only use defined preset labels:

```typescript
// ✅ Valid - 'success' is a defined preset
userHandlers.useMock({
  method: 'get',
  path: '/api/user',
  preset: 'success',
});

// ❌ TypeScript Error - 'unknown' is not a defined preset
userHandlers.useMock({
  method: 'get',
  path: '/api/user',
  preset: 'unknown',
});
```

### Response Type Safety

The response type is inferred from your preset definitions:

```typescript
const userHandler = http
  .get('/api/user', () => {
    return HttpResponse.json(null);
  })
  .presets({
    label: 'success',
    status: 200,
    response: { name: 'John', age: 30 },
  });

const userHandlers = extendHandlers(userHandler);

userHandlers.useMock({
  method: 'get',
  path: '/api/user',
  preset: 'success',
  override: ({ data }) => {
    data.name = 'Jane'; // ✅ Valid
    data.age = 25; // ✅ Valid
    data.invalid = true; // ❌ TypeScript Error - Property 'invalid' does not exist
  },
});
```

## Using with Tests

```typescript
import { setupServer } from 'msw/node';
import { http, extendHandlers } from 'msw-scenarios';
import { HttpResponse } from 'msw';

const handler = http
  .get('/api/test', () => {
    return HttpResponse.json(null);
  })
  .presets({
    label: 'success',
    status: 200,
    response: { data: 'test' },
  });

const testHandlers = extendHandlers(handler);
const server = setupServer(...testHandlers.handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('should return preset data', async () => {
  testHandlers.useMock({
    method: 'get',
    path: '/api/test',
    preset: 'success',
  });

  const response = await fetch('/api/test');
  const data = await response.json();

  expect(data).toEqual({ data: 'test' });
});
```

## Compatibility with MSW

`msw-scenarios` is fully compatible with MSW 2.x.x and provides access to all MSW features. You can:

- Use all MSW request handlers (http, GraphQL)
- Access MSW's context utilities
- Use MSW's response composition tools
- Leverage MSW's built-in testing utilities

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
