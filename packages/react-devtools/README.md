# @msw-scenarios/react-devtools

React DevTools for MSW Scenarios - A GUI interface for managing API mocking presets.

## Features

- 🎯 **Visual Preset Management**: Switch between API presets with an intuitive GUI
- 📋 **Profile System**: Group related presets into profiles for different scenarios
- 📊 **Real-time API Logging**: Monitor mocked and real API calls
- ⌨️ **Keyboard Shortcuts**: Quick access with Ctrl+Shift+M
- 🎨 **Themeable**: Support for light/dark themes
- 📱 **Responsive**: Works on desktop and mobile devices

## Installation

```bash
npm install @msw-scenarios/react-devtools
# or
yarn add @msw-scenarios/react-devtools
# or
pnpm add @msw-scenarios/react-devtools
```

## Quick Start

```tsx
import { MswDevtools } from '@msw-scenarios/react-devtools';

function App() {
  return (
    <div>
      {/* Your app content */}
      
      {/* Add MSW DevTools */}
      <MswDevtools 
        position="bottom-right"
        enableKeyboardShortcuts={true}
        theme="auto"
      />
    </div>
  );
}
```

## API Reference

### MswDevtools Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `'bottom-left' \| 'bottom-right' \| 'top-left' \| 'top-right'` | `'bottom-right'` | Position of the floating toggle button |
| `defaultOpen` | `boolean` | `false` | Whether the devtools panel is open by default |
| `enableKeyboardShortcuts` | `boolean` | `true` | Enable Ctrl+Shift+M keyboard shortcut |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Theme preference |

## Components

- **BottomSheet**: Draggable panel container
- **PresetSelector**: Interface for managing individual presets
- **ProfileManager**: Interface for managing preset profiles
- **MockingStatus**: Real-time status indicator
- **ApiLogger**: API call monitoring and logging

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint
```

## Integration with @msw-scenarios/core

This package is designed to work seamlessly with `@msw-scenarios/core`. Make sure you have MSW and the core package properly configured in your application.

## License

MIT