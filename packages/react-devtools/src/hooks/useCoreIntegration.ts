import { useState, useEffect, useCallback, useRef } from 'react';
import type { PresetInfo, ProfileInfo } from '../types';

interface CoreIntegration {
  handlers?: any;
  mockingState?: any;
  workerManager?: any;
}

/**
 * Hook for integrating with @msw-scenarios/core library
 * Provides real-time synchronization with MSW state
 */
export function useCoreIntegration() {
  const [isConnected, setIsConnected] = useState(false);
  const [core, setCore] = useState<CoreIntegration | null>(null);
  const [handlers, setHandlers] = useState<any>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Try to connect to MSW core
    const connectToCore = async () => {
      if (typeof window !== 'undefined') {
        try {
          // Try window.__MSW_SCENARIOS__ first (set by browser.ts)
          let mswCore = (window as any).__MSW_SCENARIOS__;
          let mswHandlers = (window as any).__MSW_HANDLERS__;

          // If not found, try to import from @msw-scenarios/core
          if (!mswCore) {
            try {
              const coreModule = await import('@msw-scenarios/core');
              if (coreModule) {
                mswCore = {
                  handlers: mswHandlers,
                  mockingState: coreModule.mockingState,
                  workerManager: coreModule.workerManager,
                };
              }
            } catch (e) {
              // Import failed, continue with window object
            }
          }

          if (mswCore || mswHandlers) {
            setCore(mswCore || {});
            setHandlers(mswHandlers);
            setIsConnected(true);
            console.log('[DevTools] Connected to MSW core');
            return true;
          }
        } catch (error) {
          console.log('[DevTools] Failed to connect to MSW core:', error);
        }
      }
      return false;
    };

    // Initial connection attempt
    connectToCore().then((connected) => {
      if (!connected) {
        // Retry connection after a delay
        const retryTimer = setInterval(() => {
          connectToCore().then((success) => {
            if (success) {
              clearInterval(retryTimer);
            }
          });
        }, 1000);

        // Stop retrying after 10 seconds
        setTimeout(() => clearInterval(retryTimer), 10000);

        return () => clearInterval(retryTimer);
      }
    });
  }, []);

  // Subscribe to state changes
  useEffect(() => {
    if (core?.mockingState && !unsubscribeRef.current) {
      const unsubscribe = core.mockingState.subscribeToChanges((state: any) => {
        console.log('[DevTools] State changed:', state);
      });
      unsubscribeRef.current = unsubscribe;
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [core]);

  const getHandlers = useCallback(() => {
    // Get handlers from window or core
    if (handlers?.handlers) {
      return handlers.handlers;
    }
    if (core?.handlers?.handlers) {
      return core.handlers.handlers;
    }
    return [];
  }, [core, handlers]);

  const getPresets = useCallback((): PresetInfo[] => {
    const handlersList = getHandlers();
    const presets: PresetInfo[] = [];

    handlersList.forEach((handler: any) => {
      if (handler._presets) {
        const currentPreset = handler.getCurrentPreset
          ? handler.getCurrentPreset()
          : null;

        handler._presets.forEach((preset: any) => {
          const isActive = currentPreset?.label === preset.label;

          presets.push({
            id: `${handler._method}-${handler._path}-${preset.label}`,
            label: preset.label,
            method: handler._method.toUpperCase(),
            path: handler._path,
            status: preset.status,
            active: isActive,
          });
        });
      }
    });

    return presets;
  }, [getHandlers]);

  const togglePreset = useCallback(
    (preset: PresetInfo) => {
      if (!handlers) {
        console.warn('[DevTools] Handlers not available');
        return;
      }

      const method = preset.method.toLowerCase();
      const path = preset.path;
      const presetLabel = preset.label;

      console.log(
        `[DevTools] Toggling preset: ${method} ${path} -> ${presetLabel}`
      );

      // Call handlers.useMock directly
      if (handlers.useMock) {
        try {
          handlers.useMock({
            method,
            path,
            preset: presetLabel,
          });

          // Also update through mockingState if available
          if (core?.mockingState) {
            const handler = getHandlers().find(
              (h: any) => h._method === method && h._path === path
            );
            if (handler) {
              const targetPreset = handler._presets.find(
                (p: any) => p.label === presetLabel
              );
              if (targetPreset) {
                core.mockingState.setSelected(method, path, {
                  preset: {
                    label: targetPreset.label,
                    status: targetPreset.status,
                    response: targetPreset.response,
                  },
                });
              }
            }
          }

          // Update worker if available
          if (core?.workerManager) {
            core.workerManager.updateHandlers();
          }

          console.log(`[DevTools] Preset toggled successfully`);
        } catch (error) {
          console.error('[DevTools] Failed to toggle preset:', error);
        }
      } else {
        console.warn('[DevTools] useMock method not available on handlers');
      }
    },
    [handlers, core, getHandlers]
  );

  const clearAllPresets = useCallback(() => {
    if (core?.mockingState) {
      core.mockingState.resetAll();

      // Update worker if available
      if (core.workerManager) {
        core.workerManager.updateHandlers();
      }
    }
  }, [core]);

  const getProfiles = useCallback((): ProfileInfo[] => {
    if (!handlers?.createMockProfiles) {
      return [];
    }

    // This would need to be implemented based on the actual profile structure
    return [];
  }, [handlers]);

  const setActiveProfile = useCallback(
    (profileName: string) => {
      if (!handlers?.profiles) {
        return;
      }

      const profiles = handlers.profiles;
      if (profiles && profiles.useMock) {
        profiles.useMock(profileName);
      }
    },
    [handlers]
  );

  return {
    isConnected,
    getPresets,
    togglePreset,
    clearAllPresets,
    getProfiles,
    setActiveProfile,
  };
}
