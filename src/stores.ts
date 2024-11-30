import { create } from 'zustand';
import { produce } from 'immer';
import { Preset, SelectedPreset } from './types';

type PresetState = {
  presets: Record<string, Preset[]>;
  setPresets: (path: string, presets: Preset[]) => void;
  getPresets: (path: string) => Preset[] | undefined;
  clearPresets: () => void;
};

type SelectedPresetState = {
  selected: Record<string, SelectedPreset>;
  setSelected: (path: string, preset: SelectedPreset) => void;
  getSelected: (path: string) => SelectedPreset | undefined;
  clearSelected: () => void;
};

export const usePresetStore = create<PresetState>((set, get) => ({
  presets: {},
  setPresets: (path, presets) =>
    set(
      produce((state) => {
        state.presets[path] = presets;
      })
    ),
  getPresets: (path) => get().presets[path],
  clearPresets: () => set({ presets: {} }),
}));

export const useSelectedPresetStore = create<SelectedPresetState>(
  (set, get) => ({
    selected: {},
    setSelected: (path, preset) =>
      set(
        produce((state) => {
          state.selected[path] = preset;
        })
      ),
    getSelected: (path) => get().selected[path],
    clearSelected: () => set({ selected: {} }),
  })
);
