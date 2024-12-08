import {
  presetActions,
  selectedPresetActions,
  selectedPresetStore,
} from './store/stores';
import type { MockingState, MockingStatus } from './types';

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
  subscribeToChanges: <Name extends string = string>(
    callback: (state: {
      mockingStatus: Array<MockingStatus>;
      currentProfile: Name | null;
    }) => void
  ) => {
    return selectedPresetStore.subscribe((state) => {
      const mockingStatus = Object.entries(state.selected).map(
        ([key, selected]) => {
          const [method, path] = key.split(':');
          return {
            path,
            method,
            currentPreset: selected.preset.label,
          };
        }
      );

      callback({
        mockingStatus,
        currentProfile: state.currentProfile as Name | null,
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
