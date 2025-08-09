import { useState, useEffect, useCallback } from 'react';
import { storage, StorageData, debounce } from '../utils/storage';

/**
 * Custom hook for managing localStorage state with automatic persistence
 */
export function useLocalStorage<K extends keyof StorageData>(
  key: K,
  defaultValue: StorageData[K],
  debounceMs: number = 300
): [StorageData[K], (value: StorageData[K]) => void, () => void] {
  // Initialize state from localStorage or use default
  const [state, setState] = useState<StorageData[K]>(() => {
    // During SSR, always use default value
    if (typeof window === 'undefined') {
      return defaultValue;
    }
    const stored = storage.get(key);
    return stored !== null ? stored : defaultValue;
  });

  // Save function with optional debouncing
  const saveToStorage = useCallback(
    debounceMs > 0
      ? debounce((value: StorageData[K]) => {
          storage.set(key, value);
        }, debounceMs)
      : (value: StorageData[K]) => {
          storage.set(key, value);
        },
    [key, debounceMs]
  );

  // Update function that updates both state and localStorage
  const updateValue = useCallback(
    (value: StorageData[K]) => {
      setState(value);
      saveToStorage(value);
    },
    [saveToStorage]
  );

  // Clear function
  const clearValue = useCallback(() => {
    setState(defaultValue);
    storage.remove(key);
  }, [key, defaultValue]);

  // Listen for storage events from other tabs/windows
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      const storageKey = `msw-devtools:${key}`;
      if (e.key === storageKey && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setState(parsed.value);
        } catch (error) {
          console.error('Failed to parse storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [state, updateValue, clearValue];
}

/**
 * Hook for managing all DevTools settings
 */
export function useDevToolsSettings() {
  const defaultSettings: StorageData['settings'] = {
    theme: 'auto',
    position: 'bottom-right',
    defaultOpen: false,
    enableKeyboardShortcuts: true,
  };

  const [settings, setSettings, clearSettings] = useLocalStorage(
    'settings',
    defaultSettings
  );

  const updateSetting = useCallback(
    <K extends keyof StorageData['settings']>(
      key: K,
      value: StorageData['settings'][K]
    ) => {
      setSettings({
        ...settings,
        [key]: value,
      });
    },
    [settings, setSettings]
  );

  return {
    settings,
    updateSetting,
    setSettings,
    clearSettings,
  };
}

/**
 * Hook for managing search filters
 */
export function useSearchFilters() {
  const defaultFilters: StorageData['searchFilters'] = {
    searchTerm: '',
    filterMethod: 'all',
  };

  const [filters, setFilters, clearFilters] = useLocalStorage(
    'searchFilters',
    defaultFilters,
    500 // Longer debounce for search
  );

  return {
    filters,
    setFilters,
    clearFilters,
  };
}
