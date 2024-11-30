import { createStore } from './createStore';
import { produce } from 'immer';

export type Preset = {
  label: string;
  status: number;
  response: any;
};

export type SelectedPreset<T = any> = {
  preset: { label: string; status: number; response: T };
  override?: (draft: { data: T }) => void;
};

export interface PresetState {
  presets: Record<string, Preset[]>;
}

export interface SelectedPresetState {
  selected: Record<string, SelectedPreset>;
}

export const presetStore = createStore<PresetState>({ presets: {} });
export const selectedPresetStore = createStore<SelectedPresetState>({
  selected: {},
});

export const presetActions = {
  setPresets: (path: string, presets: Preset[]) => {
    presetStore.setState(
      produce((state: PresetState) => {
        state.presets[path] = presets;
      })
    );
  },
  getPresets: (path: string) => presetStore.getState().presets[path],
  clearPresets: () => presetStore.setState({ presets: {} }),
};

export const selectedPresetActions = {
  setSelected: (path: string, preset: SelectedPreset) => {
    selectedPresetStore.setState(
      produce((state: SelectedPresetState) => {
        state.selected[path] = preset;
      })
    );
  },
  getSelected: (path: string) => selectedPresetStore.getState().selected[path],
  clearSelected: () => selectedPresetStore.setState({ selected: {} }),
};
