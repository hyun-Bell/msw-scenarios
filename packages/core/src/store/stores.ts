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
export const selectedPresetStore = createStore<SelectedPresetState>({
  selected: {},
  currentProfile: null,
});

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
