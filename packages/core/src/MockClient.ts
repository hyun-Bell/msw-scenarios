import type {
  ExtendedHandlers,
  MockingState,
  StatusSubscriber,
  PresetHandler,
} from './types';
import { mockingState } from './mockingState';
import { workerManager } from './worker';

// Global registry for MockClient instances
const globalRegistry = new Map<string, MockClient>();

export interface MockClientOptions {
  onUnhandledRequest?: 'bypass' | 'warn' | 'error';
  serviceWorker?: {
    url?: string;
    options?: RegistrationOptions;
  };
}

/**
 * Central client for managing MSW handlers and state
 * Similar to QueryClient in React Query
 */
export class MockClient {
  private handlers: ExtendedHandlers<readonly PresetHandler[]> | null = null;
  private state: MockingState;
  private initialized = false;
  private options: MockClientOptions;
  private id: string;

  constructor(options: MockClientOptions = {}) {
    this.state = mockingState;
    this.options = {
      onUnhandledRequest: 'bypass',
      ...options,
    };
    this.id = `mock-client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Register this instance globally
    globalRegistry.set(this.id, this);

    // Also set as default if none exists
    if (globalRegistry.size === 1 || !MockClient.getDefault()) {
      MockClient.setDefault(this);
    }
  }

  /**
   * Register handlers and automatically setup MSW
   */
  async registerHandlers(handlers: ExtendedHandlers<readonly PresetHandler[]>) {
    console.log('[MockClient] Registering handlers...');
    this.handlers = handlers;

    // Register handlers with worker manager
    if (handlers.handlers) {
      console.log(
        '[MockClient] Registering',
        handlers.handlers.length,
        'handlers with worker manager'
      );
      workerManager.registerHandlers([...handlers.handlers]);
    }

    // Auto setup worker in browser environment
    if (typeof window !== 'undefined' && !this.initialized) {
      console.log('[MockClient] Setting up MSW worker...');
      await this.setupWorker();
    }

    // Emit event for DevTools integration
    this.emitHandlersUpdate();

    console.log('[MockClient] Handler registration complete');
    return this;
  }

  /**
   * Setup MSW worker for browser environment
   */
  private async setupWorker() {
    // Only works in browser environment
    if (typeof window === 'undefined') {
      console.warn('MockClient currently only supports browser environment');
      return null;
    }

    try {
      // Browser environment - setup worker
      const { setupWorker } = await import('msw/browser');

      if (!this.handlers?.handlers) {
        console.warn('No handlers registered');
        return null;
      }

      const worker = setupWorker(...this.handlers.handlers);
      console.log(
        '[MockClient] Created worker with',
        this.handlers.handlers.length,
        'handlers'
      );

      await worker.start({
        onUnhandledRequest: this.options.onUnhandledRequest,
        serviceWorker: this.options.serviceWorker,
      });

      workerManager.setupWorker(worker);
      this.initialized = true;

      console.log('✅ MSW Mock Client initialized successfully');
      console.log('[MockClient] Worker started and registered');
      return worker;
    } catch (error) {
      console.error('Failed to setup MSW worker:', error);
      return null;
    }
  }

  /**
   * Get current mocking state
   */
  getState(): MockingState {
    return this.state;
  }

  /**
   * Get registered handlers
   */
  getHandlers(): ExtendedHandlers<readonly PresetHandler[]> | null {
    return this.handlers;
  }

  /**
   * Subscribe to state changes
   */
  subscribeToChanges(callback: StatusSubscriber) {
    return this.state.subscribeToChanges(callback);
  }

  /**
   * Reset all mocks to default state
   */
  reset() {
    this.state.resetAll();
  }

  /**
   * Check if client is initialized
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Clear all handlers and reset state
   */
  clear() {
    this.handlers = null;
    this.state.resetAll();
    this.initialized = false;
  }

  /**
   * Destroy this client and remove from registry
   */
  destroy() {
    this.clear();
    globalRegistry.delete(this.id);

    // If this was the default, clear it
    if (MockClient.getDefault() === this) {
      MockClient.clearDefault();
    }
  }

  /**
   * Get client ID
   */
  getId() {
    return this.id;
  }

  /**
   * DevTools Integration API
   */

  /**
   * Get all presets from handlers
   */
  getAllPresets() {
    if (!this.handlers?.handlers) return [];

    const presets: any[] = [];
    this.handlers.handlers.forEach((handler: any) => {
      if (handler._presets) {
        const currentPreset = handler.getCurrentPreset?.();

        handler._presets.forEach((preset: any) => {
          // Use a safe encoding for the ID to avoid parsing issues
          const idData = {
            method: handler._method,
            path: handler._path,
            label: preset.label,
          };
          const id = btoa(JSON.stringify(idData));

          presets.push({
            id,
            label: preset.label,
            method: handler._method.toUpperCase(),
            path: handler._path,
            status: preset.status,
            active: currentPreset?.label === preset.label,
            response: preset.response,
          });
        });
      }
    });

    console.log('[MockClient] getAllPresets:', presets.length, 'presets found');
    return presets;
  }

  /**
   * Toggle a preset by ID
   */
  togglePreset(presetId: string) {
    if (!this.handlers) {
      console.warn('[MockClient] No handlers registered');
      return false;
    }

    try {
      // Decode the preset ID
      const idData = JSON.parse(atob(presetId));
      const { method, path, label } = idData;

      console.log('[MockClient] Toggling preset:', { method, path, label });

      // Use handlers.useMock to toggle
      if (this.handlers.useMock) {
        this.handlers.useMock({
          method: method as any,
          path,
          preset: label,
        });

        // Update worker
        workerManager.updateHandlers();

        // Emit update event
        this.emitHandlersUpdate();

        console.log('[MockClient] Preset toggled successfully');
        return true;
      } else {
        console.error('[MockClient] handlers.useMock is not available');
        return false;
      }
    } catch (error) {
      console.error('[MockClient] Failed to toggle preset:', error);
      console.error('[MockClient] PresetId:', presetId);
      return false;
    }
  }

  /**
   * Set active preset for an endpoint
   */
  setActivePreset(method: string, path: string, presetLabel: string) {
    if (!this.handlers?.useMock) {
      console.warn('[MockClient] handlers.useMock is not available');
      return false;
    }

    console.log('[MockClient] Setting active preset:', {
      method,
      path,
      presetLabel,
    });

    try {
      this.handlers.useMock({
        method: method.toLowerCase() as any,
        path,
        preset: presetLabel,
      });

      // Update worker
      workerManager.updateHandlers();

      // Emit update event
      this.emitHandlersUpdate();

      console.log('[MockClient] Active preset set successfully');
      return true;
    } catch (error) {
      console.error('[MockClient] Failed to set active preset:', error);
      return false;
    }
  }

  /**
   * Clear all active presets
   */
  clearAllPresets() {
    this.state.resetAll();
    workerManager.updateHandlers();
    this.emitHandlersUpdate();
  }

  /**
   * Emit handlers update event for DevTools
   */
  private emitHandlersUpdate() {
    if (typeof window !== 'undefined') {
      const presets = this.getAllPresets();
      console.log(
        '[MockClient] Emitting handlers update with',
        presets.length,
        'presets'
      );
      window.dispatchEvent(
        new CustomEvent('msw-handlers-update', {
          detail: {
            clientId: this.id,
            presets,
          },
        })
      );
    }
  }

  // Static methods for global registry

  /**
   * Get all registered MockClient instances
   */
  static getAll(): MockClient[] {
    return Array.from(globalRegistry.values());
  }

  /**
   * Get a MockClient by ID
   */
  static getById(id: string): MockClient | undefined {
    return globalRegistry.get(id);
  }

  /**
   * Get the default MockClient instance
   */
  static getDefault(): MockClient | null {
    if (
      typeof window !== 'undefined' &&
      (window as any).__MSW_DEFAULT_CLIENT__
    ) {
      return (window as any).__MSW_DEFAULT_CLIENT__;
    }
    // Return first registered client if no default set
    const clients = MockClient.getAll();
    return clients.length > 0 ? clients[0] : null;
  }

  /**
   * Set the default MockClient instance
   */
  static setDefault(client: MockClient) {
    if (typeof window !== 'undefined') {
      (window as any).__MSW_DEFAULT_CLIENT__ = client;
    }
  }

  /**
   * Clear the default MockClient
   */
  static clearDefault() {
    if (typeof window !== 'undefined') {
      delete (window as any).__MSW_DEFAULT_CLIENT__;
    }
  }

  /**
   * Clear all registered clients
   */
  static clearAll() {
    globalRegistry.forEach((client) => client.destroy());
    globalRegistry.clear();
    MockClient.clearDefault();
  }
}

// Export a function to get or create default instance
export function getDefaultMockClient(): MockClient {
  let defaultClient = MockClient.getDefault();
  if (!defaultClient) {
    defaultClient = new MockClient();
    MockClient.setDefault(defaultClient);
  }
  return defaultClient;
}
