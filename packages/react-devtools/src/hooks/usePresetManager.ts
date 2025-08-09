'use client';
import { useState, useEffect, useCallback } from 'react';
import { useCoreIntegration } from './useCoreIntegration';
import type { PresetInfo } from '../types';

interface UsePresetManagerReturn {
  presets: PresetInfo[];
  activePresets: PresetInfo[];
  togglePreset: (preset: PresetInfo) => void;
  clearAllPresets: () => void;
  refreshPresets: () => void;
}

export function usePresetManager(): UsePresetManagerReturn {
  const {
    isConnected,
    getPresets: getCorePresets,
    togglePreset: coreTogglePreset,
    clearAllPresets: coreClearAll,
  } = useCoreIntegration();

  const [presets, setPresets] = useState<PresetInfo[]>([]);
  const [activePresets, setActivePresets] = useState<PresetInfo[]>([]);

  // Initialize presets from core
  useEffect(() => {
    if (!isConnected) return;

    const refreshPresetsFromCore = () => {
      const corePresets = getCorePresets();
      if (corePresets.length > 0) {
        setPresets(corePresets);

        // Update active presets based on what's active in core
        const currentlyActive = corePresets.filter((p) => p.active);
        setActivePresets(currentlyActive);
      }
    };

    // Initial load
    refreshPresetsFromCore();

    // Periodically sync with MSW state (every 1 second)
    const interval = setInterval(refreshPresetsFromCore, 1000);

    return () => clearInterval(interval);
  }, [isConnected, getCorePresets]);

  const togglePreset = useCallback(
    (preset: PresetInfo) => {
      const isCurrentlyActive = activePresets.some((p) => p.id === preset.id);

      // Update local state immediately for UI responsiveness
      const newActivePresets = isCurrentlyActive
        ? activePresets.filter((p) => p.id !== preset.id)
        : [...activePresets, preset];

      setActivePresets(newActivePresets);

      // Update presets list
      setPresets((prev) =>
        prev.map((p) =>
          p.id === preset.id ? { ...p, active: !isCurrentlyActive } : p
        )
      );

      // Sync with MSW core
      if (isConnected && coreTogglePreset) {
        coreTogglePreset(preset);
      }
    },
    [activePresets, isConnected, coreTogglePreset]
  );

  const clearAllPresets = useCallback(() => {
    // Clear local state
    setActivePresets([]);
    setPresets((prev) => prev.map((p) => ({ ...p, active: false })));

    // Sync with MSW core
    if (isConnected && coreClearAll) {
      coreClearAll();
    }
  }, [isConnected, coreClearAll]);

  const refreshPresets = useCallback(() => {
    if (isConnected && getCorePresets) {
      const corePresets = getCorePresets();
      setPresets(corePresets);

      // Update active state based on what's actually active in MSW
      const mswActivePresets = corePresets.filter((p) => p.active);
      if (mswActivePresets.length > 0) {
        setActivePresets(mswActivePresets);
      }
    }
  }, [isConnected, getCorePresets]);

  return {
    presets,
    activePresets,
    togglePreset,
    clearAllPresets,
    refreshPresets,
  };
}
