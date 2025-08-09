# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

msw-scenarios is a type-safe preset management system built on top of MSW (Mock Service Worker) 2.x.x. This is a **pnpm workspace monorepo** with multiple packages that enhance MSW with a preset system while maintaining complete TypeScript integration for flexible and type-safe API mocking.

## Monorepo Structure

This project uses **pnpm workspaces** with the following packages:

### Core Library (`packages/core/`)
- **Package**: `@msw-scenarios/core`
- **Purpose**: Main library with preset management system
- **Build**: Vite → UMD & ES modules
- **Dependencies**: MSW ^2.6.0, immer ^10.1.1

### React DevTools (`packages/react-devtools/`)  
- **Package**: `@msw-scenarios/react-devtools`
- **Purpose**: GUI interface for managing presets and profiles
- **Build**: Vite → React components
- **Dependencies**: React >=16.8.0, Radix UI, Tailwind CSS

### Examples (`packages/examples/`)
- **nextjs-app-router/**: Next.js 13+ App Router integration example

## Architecture

### Core Components (packages/core/src/)

1. **HTTP Handler Extension** (`packages/core/src/http.ts`): Wraps MSW's http methods to add preset functionality through `createMethodHandler`, intercepting requests to check for preset configurations
2. **Extended Handlers** (`packages/core/src/extendHandlers.ts`): Manages handler collections with preset switching, profile management, and real-time state subscriptions
3. **Mocking State** (`packages/core/src/mockingState.ts`): Global state management for current mock configurations using a store pattern with immer for immutability
4. **Worker Manager** (`packages/core/src/worker.ts`): Handles MSW worker/server lifecycle and handler updates
5. **Store System** (`packages/core/src/store/`): State management using immer for immutable updates

### Key Patterns

- **Preset System**: Each handler can have multiple named response presets with status codes and response data
- **Profile Management**: Groups of preset configurations that can be applied together
- **Type Safety**: Full TypeScript support with type inference for paths, methods, and response types
- **State Subscription**: React-friendly state management with subscription patterns

## Development Commands

### Monorepo Commands (from root)

```bash
# Install all dependencies
pnpm install

# Build all packages
pnpm build

# Build specific packages
pnpm build:core          # Core library only
pnpm build:devtools      # React DevTools only

# Testing
pnpm test               # All packages
pnpm test:core          # Core package unit tests
pnpm test:e2e           # E2E tests (starts Next.js app)
pnpm test:e2e:ui        # E2E tests with Playwright UI
pnpm test:e2e:dev       # Start test app manually

# Development
pnpm dev                # Start React DevTools dev server

# Examples
pnpm example:dev        # Start Next.js example
pnpm example:build      # Build Next.js example
pnpm example:start      # Start built Next.js example

# Code Quality
pnpm lint               # Lint all packages
pnpm lint:fix           # Auto-fix lint issues
pnpm format             # Format all packages
pnpm format:check       # Check formatting

# Release
pnpm changeset          # Create changeset
pnpm version-packages   # Version bump
pnpm release           # Build and publish
```

### Package-Specific Commands

```bash
# Core library (packages/core/)
cd packages/core
pnpm build              # Build library
pnpm test               # Unit tests
pnpm test:e2e           # E2E tests
pnpm test:e2e:ui        # E2E with UI

# React DevTools (packages/react-devtools/)
cd packages/react-devtools
pnpm build              # Build DevTools
pnpm dev                # Development server
pnpm storybook          # Storybook (if available)
```

## Testing

### Unit Tests (Jest) - Core Package Only
- **Location**: `packages/core/tests/unit/`
- **Config**: `packages/core/jest.config.js`
- **Files**: `preset.test.ts`, `profile.test.ts`, `store.test.ts`, `type-inference.test.ts`, `worker.test.ts`
- **Run**: `pnpm test:core` or `cd packages/core && pnpm test`
- **Coverage**: Automatically generated in `packages/core/coverage/`

### E2E Tests (Playwright) - Core Package Only
- **Location**: `packages/core/tests/e2e/specs/`
- **Config**: `packages/core/playwright.config.ts`
- **Test App**: `packages/core/tests/e2e/test-app/` (Next.js app)
- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Environment**: `NEXT_PUBLIC_API_MOCKING=enabled` enables MSW
- **Run**: `pnpm test:e2e` (starts Next.js app automatically)
- **UI Mode**: `pnpm test:e2e:ui`

## Project Structure

```
packages/
├── core/                           # @msw-scenarios/core
│   ├── src/                       # Core library source
│   │   ├── http.ts               # HTTP method handlers with preset support
│   │   ├── extendHandlers.ts     # Handler extension and profile management
│   │   ├── mockingState.ts       # Global state management
│   │   ├── worker.ts             # MSW worker/server management
│   │   ├── types.ts              # TypeScript type definitions (248 lines)
│   │   └── store/                # State management implementation
│   │       ├── createStore.ts    # Store factory
│   │       └── stores.ts         # Action definitions
│   ├── tests/                    # Test suites
│   │   ├── unit/                 # Jest unit tests
│   │   └── e2e/                  # Playwright E2E tests
│   │       ├── specs/            # Test specifications
│   │       ├── test-app/         # Next.js test application
│   │       └── test-utils/       # Test utilities
│   ├── dist/                     # Build output (UMD and ES modules)
│   ├── jest.config.js            # Jest configuration
│   ├── playwright.config.ts      # Playwright configuration
│   └── vite.config.ts            # Vite build configuration
├── react-devtools/               # @msw-scenarios/react-devtools
│   ├── src/                      # DevTools components
│   │   ├── components/           # React components
│   │   ├── hooks/                # Custom hooks
│   │   ├── index.ts              # Main export
│   │   └── types.ts              # DevTools types
│   ├── demo/                     # Demo application
│   └── dist/                     # Build output
└── examples/                     # Usage examples
    └── nextjs-app-router/        # Next.js 13+ example
```

## Key APIs

### Creating Handlers with Presets
```typescript
const handler = http.get('/api/user', defaultResolver)
  .presets(
    { label: 'success', status: 200, response: {...} },
    { label: 'error', status: 404, response: {...} }
  );
```

### Using Extended Handlers
```typescript
const handlers = extendHandlers(userHandler, postsHandler);
handlers.useMock({ method: 'get', path: '/api/user', preset: 'success' });
```

### Profile Management
```typescript
const profiles = handlers.createMockProfiles(
  { name: 'Empty State', actions: ({useMock}) => {...} },
  { name: 'Error State', actions: ({useMock}) => {...} }
);
profiles.useMock('Empty State');
```

## Build Configuration

### Core Package (`@msw-scenarios/core`)
- **Build Tool**: Vite with TypeScript plugin for type generation
- **Config**: `packages/core/vite.config.ts`
- **TypeScript**: ES6 target, ESNext modules, strict mode
- **External Dependencies**: MSW is external (peer dependency)
- **Output**: UMD (`dist/msw-scenarios.umd.js`) and ES (`dist/msw-scenarios.es.js`) modules
- **Types**: `dist/types/index.d.ts`

### React DevTools (`@msw-scenarios/react-devtools`)
- **Build Tool**: Vite with React plugin
- **Config**: `packages/react-devtools/vite.config.ts`
- **Output**: ES modules with TypeScript definitions
- **Styling**: Tailwind CSS with PostCSS

## Workspace Configuration

- **Workspace Manager**: pnpm workspaces
- **Config**: `pnpm-workspace.yaml`
- **Packages**: `packages/*` and `packages/examples/*`
- **Dependencies**: Shared devDependencies in root, package-specific in each package
- **Scripts**: Root scripts delegate to package-specific scripts using `--filter`

## Code Style

- **Linting**: ESLint with TypeScript support across all packages
- **Formatting**: Prettier with consistent configuration
- **Style Rules**: Semicolons required, single quotes for strings
- **TypeScript**: No explicit `any` types allowed (warning level)
- **Commit**: Changesets for version management

## Important Notes for Development

### Requirements
- **Node**: >=18
- **pnpm**: >=8 (required for workspace features)
- **MSW**: ^2.6.0 (peer dependency)
- **React**: >=16.8.0 (for DevTools and examples)

### Key Dependencies
- **Core**: MSW ^2.6.0, immer ^10.1.1
- **DevTools**: React >=16.8.0, Radix UI components, Tailwind CSS
- **Testing**: Jest (unit), Playwright (E2E), Next.js (test app)

### Worker Setup
- **Browser**: `workerManager.setupWorker()` 
- **Node.js**: `workerManager.setupServer()`
- **MSW File**: Public directory must contain `mockServiceWorker.js`

### Development Workflow
1. Install dependencies: `pnpm install` (root)
2. Build packages: `pnpm build` (builds all)
3. Run tests: `pnpm test` (all packages)
4. Start dev server: `pnpm dev` (DevTools) or `pnpm example:dev` (Next.js)
5. Create changes: `pnpm changeset` → `pnpm version-packages` → `pnpm release`