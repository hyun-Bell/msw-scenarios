import { produce } from 'immer';
import { createStore } from './createStore';

export type Preset = {
  label: string;
  status: number;
  response: any | (() => Promise<any>);
};

export type SelectedPreset<T = any> = {
  preset: {
    label: string;
    status: number;
    response: T | (() => Promise<T>);
  };
  override?: (draft: { data: T }) => void;
};

export interface PresetState {
  presets: Record<string, Preset[]>;
}

export interface SelectedPresetState {
  selected: Record<string, SelectedPreset>;
  currentProfile: string | null;
}

export const presetStore = createStore<PresetState>({ presets: {} });

// selectedPresetStore에 localStorage 지속성 추가
export const selectedPresetStore = createStore<SelectedPresetState>(
  {
    selected: {},
    currentProfile: null,
  },
  {
    persist: {
      key: 'msw-scenarios-selected-presets',
      // response 함수는 직렬화할 수 없으므로 필터링
      serialize: (state) => {
        const serializable = {
          selected: Object.entries(state.selected).reduce(
            (acc, [key, value]) => {
              // response가 함수인 경우 제외하고 저장
              if (typeof value.preset.response !== 'function') {
                acc[key] = {
                  preset: {
                    label: value.preset.label,
                    status: value.preset.status,
                    // response는 저장하지 않음 (함수일 수 있음)
                  },
                };
              }
              return acc;
            },
            {} as Record<string, any>
          ),
          currentProfile: state.currentProfile,
        };
        return JSON.stringify(serializable);
      },
      deserialize: (value) => {
        const parsed = JSON.parse(value);
        // 복원 시 response는 나중에 실제 handler에서 가져옴
        return parsed;
      },
    },
  }
);

export const presetActions = {
  setPresets: (path: string, presets: Preset[]) => {
    presetStore.setState(
      produce((state: PresetState) => {
        state.presets[path] = [...presets];
      })
    );
  },
  getPresets: (path: string) => presetStore.getState().presets[path],
  clearPresets: () => presetStore.setState({ presets: {} }),
};

export const selectedPresetActions = {
  setSelected: (method: string, path: string, preset: SelectedPreset) => {
    const key = `${method}:${path}`;
    selectedPresetStore.setState(
      produce((state: SelectedPresetState) => {
        state.selected[key] = { ...preset };
      })
    );
  },
  getSelected: (method: string, path: string) => {
    const key = `${method}:${path}`;
    return selectedPresetStore.getState().selected[key];
  },
  clearSelected: (method?: string, path?: string) => {
    selectedPresetStore.setState(
      produce((state: SelectedPresetState) => {
        if (method && path) {
          const key = `${method}:${path}`;
          delete state.selected[key];
        } else {
          state.selected = {};
          state.currentProfile = null;
        }
      })
    );
  },
  setCurrentProfile: (profileName: string | null) => {
    selectedPresetStore.setState(
      produce((state: SelectedPresetState) => {
        state.currentProfile = profileName;
      })
    );
  },
  getCurrentProfile: () => selectedPresetStore.getState().currentProfile,
};
