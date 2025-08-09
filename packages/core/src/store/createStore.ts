type Listener<T> = (state: T) => void;

export interface StoreOptions<T> {
  persist?: {
    key: string;
    storage?: Storage;
    serialize?: (state: T) => string;
    deserialize?: (value: string) => T;
  };
}

export function createStore<T>(initialState: T, options?: StoreOptions<T>) {
  const { persist } = options || {};

  // localStorage에서 초기 상태 복원
  let state = initialState;
  if (persist && typeof window !== 'undefined') {
    try {
      const stored = (persist.storage || localStorage).getItem(persist.key);
      if (stored) {
        state = persist.deserialize
          ? persist.deserialize(stored)
          : JSON.parse(stored);
        console.log(`[MSW Store] Restored state from ${persist.key}`);
      }
    } catch (error) {
      console.warn(
        `[MSW Store] Failed to restore state from ${persist.key}:`,
        error
      );
    }
  }

  const listeners = new Set<Listener<T>>();

  return {
    getState: () => state,
    setState: (nextState: T | ((prev: T) => T)) => {
      state =
        typeof nextState === 'function'
          ? (nextState as (prev: T) => T)(state)
          : nextState;

      // localStorage에 저장
      if (persist && typeof window !== 'undefined') {
        try {
          const serialized = persist.serialize
            ? persist.serialize(state)
            : JSON.stringify(state);
          (persist.storage || localStorage).setItem(persist.key, serialized);
        } catch (error) {
          console.warn(
            `[MSW Store] Failed to persist state to ${persist.key}:`,
            error
          );
        }
      }

      listeners.forEach((listener) => listener(state));
    },
    subscribe: (listener: Listener<T>) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    destroy: () => {
      listeners.clear();
    },
  };
}
