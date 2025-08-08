import {
  presetActions,
  selectedPresetActions,
  selectedPresetStore,
} from './store/stores';
import type { MockingState, StatusSubscriber } from './types';

export const mockingState: MockingState = {
  getCurrentStatus: () => {
    const state = selectedPresetStore.getState();
    return Object.entries(state.selected).map(([key, selected]) => {
      const [method, path] = key.split(':');
      return {
        path,
        method,
        currentPreset: selected.preset.label,
      };
    });
  },
  getCurrentProfile: <Name extends string = string>() =>
    selectedPresetStore.getState().currentProfile as Name | null,
  subscribeToChanges: (callback: StatusSubscriber) => {
    return selectedPresetStore.subscribe((state) => {
      const status = Object.entries(state.selected).map(([key, selected]) => {
        const [method, path] = key.split(':');
        return {
          path,
          method,
          currentPreset: selected.preset.label,
        };
      });

      callback({
        status,
        currentProfile: state.currentProfile,
      });
    });
  },
  resetAll: () => {
    presetActions.clearPresets();
    selectedPresetActions.clearSelected();
  },
  resetEndpoint: (method, path) =>
    selectedPresetActions.clearSelected(method, path),
  getEndpointState: (method, path) =>
    selectedPresetActions.getSelected(method, path),
  setSelected: (method, path, preset) =>
    selectedPresetActions.setSelected(method, path, preset),
  setCurrentProfile: <Name extends string = string>(profileName: Name | null) =>
    selectedPresetActions.setCurrentProfile(profileName),
};
