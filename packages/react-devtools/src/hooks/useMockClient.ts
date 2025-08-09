import { useState, useEffect } from 'react';
import { MockClient } from '@msw-scenarios/core';

interface UseMockClientResult {
  client: MockClient | null;
  isConnected: boolean;
  isLoading: boolean;
}

interface PresetData {
  id: string;
  label: string;
  method: string;
  path: string;
  status: number;
  active: boolean;
}

interface UseMockClientPresetsResult {
  presets: PresetData[];
  togglePreset: (presetId: string) => void;
  clearAllPresets: () => void;
}

export function useMockClient(): UseMockClientResult {
  const [client, setClient] = useState<MockClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to get the default MockClient instance
    const defaultClient = MockClient.getDefault();

    if (defaultClient) {
      setClient(defaultClient);
      setIsConnected(true);
    } else {
      // Create a new MockClient if none exists
      const newClient = new MockClient();
      setClient(newClient);
      setIsConnected(true);
    }

    setIsLoading(false);
  }, []);

  return { client, isConnected, isLoading };
}

export function useMockClientPresets(
  client: MockClient | null
): UseMockClientPresetsResult {
  const [presets, setPresets] = useState<PresetData[]>([]);

  useEffect(() => {
    if (!client) {
      setPresets([]);
      return;
    }

    const updatePresets = () => {
      // Get all presets from MockClient
      const allPresets = client.getAllPresets();
      setPresets(allPresets);
    };

    // Initial update
    updatePresets();

    // Subscribe to changes
    const unsubscribe = client.subscribeToChanges(() => {
      updatePresets();
    });

    return unsubscribe;
  }, [client]);

  const togglePreset = (presetId: string) => {
    if (!client) return;

    // Use MockClient's togglePreset method
    client.togglePreset(presetId);
  };

  const clearAllPresets = () => {
    if (!client) return;

    // Use MockClient's clearAllPresets method
    client.clearAllPresets();
  };

  return { presets, togglePreset, clearAllPresets };
}
