import { useState, useEffect } from 'react';
import type { MockingState, PresetInfo, ProfileInfo, ApiCall } from '../types';
import { useMockClient, useMockClientPresets } from './useMockClient';

export function useMockingState(): MockingState {
  const { client, isConnected } = useMockClient();
  const { presets } = useMockClientPresets(client);
  const [recentApiCalls, setRecentApiCalls] = useState<ApiCall[]>([]);

  // Convert presets to PresetInfo format
  const activePresets: PresetInfo[] = presets
    .filter((p) => p.active)
    .map((p) => ({
      id: p.id,
      label: p.label,
      method: p.method,
      path: p.path,
      status: p.status,
      active: true,
    }));

  // Track API calls (this would be enhanced with actual MSW interceptors)
  useEffect(() => {
    if (!isConnected) return;

    // Listen for fetch/XHR calls and update recentApiCalls
    // This is a simplified version - in production, we'd intercept MSW events
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const startTime = Date.now();
      const [input, init] = args;
      const url = typeof input === 'string' ? input : (input as Request).url;
      const method = (init?.method || 'GET').toUpperCase();

      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;

        // Find matching preset
        const matchingPreset = activePresets.find(
          (p) => p.path === url && p.method === method
        );

        setRecentApiCalls((prev) => [
          {
            id: `${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
            method,
            path: url,
            status: response.status,
            preset: matchingPreset?.label,
            duration,
          },
          ...prev.slice(0, 49), // Keep last 50 calls
        ]);

        return response;
      } catch (error) {
        const duration = Date.now() - startTime;

        setRecentApiCalls((prev) => [
          {
            id: `${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
            method,
            path: url,
            status: 0,
            preset: undefined,
            duration,
          },
          ...prev.slice(0, 49),
        ]);

        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [isConnected, activePresets]);

  // Build the state object
  const state: MockingState = {
    enabled: isConnected,
    activePresets,
    activeProfile: client?.getState().getCurrentProfile()
      ? {
          name: client.getState().getCurrentProfile() as string,
          active: true,
          presets: activePresets,
        }
      : undefined,
    recentApiCalls,
  };

  return state;
}
