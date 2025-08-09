/**
 * LocalStorage utility for persisting MSW DevTools state
 */

const STORAGE_PREFIX = 'msw-devtools';
const STORAGE_VERSION = '1.0.0';

export interface StorageData {
  version: string;
  activePresets: string[];
  activeProfile: string | null;
  profiles: Array<{
    name: string;
    presets: string[];
  }>;
  settings: {
    theme: 'light' | 'dark' | 'auto';
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    defaultOpen: boolean;
    enableKeyboardShortcuts: boolean;
  };
  searchFilters: {
    searchTerm: string;
    filterMethod: string;
  };
}

class LocalStorageManager {
  private getKey(key: string): string {
    return `${STORAGE_PREFIX}:${key}`;
  }

  get<K extends keyof StorageData>(key: K): StorageData[K] | null {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined' || !window.localStorage) {
        return null;
      }

      const item = localStorage.getItem(this.getKey(key));
      if (item === null) return null;
      const parsed = JSON.parse(item);
      return parsed.value;
    } catch (error) {
      console.error(`Failed to get ${key} from localStorage:`, error);
      return null;
    }
  }

  set<K extends keyof StorageData>(key: K, value: StorageData[K]): void {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }

      const data = {
        value,
        timestamp: Date.now(),
        version: STORAGE_VERSION,
      };
      localStorage.setItem(this.getKey(key), JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to set ${key} in localStorage:`, error);
    }
  }

  remove(key: keyof StorageData): void {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }

      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error(`Failed to remove ${key} from localStorage:`, error);
    }
  }

  clear(): void {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }

      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  getAllData(): Partial<StorageData> {
    const data: Partial<StorageData> = {};
    const keys: Array<keyof StorageData> = [
      'version',
      'activePresets',
      'activeProfile',
      'profiles',
      'settings',
      'searchFilters',
    ];

    keys.forEach((key) => {
      const value = this.get(key);
      if (value !== null) {
        (data as any)[key] = value;
      }
    });

    return data;
  }

  exportData(): string {
    const data = this.getAllData();
    return JSON.stringify(data, null, 2);
  }

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString) as Partial<StorageData>;
      Object.entries(data).forEach(([key, value]) => {
        this.set(key as keyof StorageData, value);
      });
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // Migration support for future version changes
  migrate(oldVersion: string, newVersion: string): void {
    console.log(`Migrating storage from ${oldVersion} to ${newVersion}`);
    // Add migration logic here as needed
  }
}

export const storage = new LocalStorageManager();

// Debounce utility for auto-save
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
