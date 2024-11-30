import { selectedPresetActions, selectedPresetStore } from './store/stores';
import type { MockingState } from './types';

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
  getCurrentProfile: () => selectedPresetActions.getCurrentProfile(),
  subscribeToChanges: (callback: any) =>
    selectedPresetStore.subscribe((state) => {
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
        currentProfile: state.currentProfile,
      });
    }),
  resetAll: () => selectedPresetActions.clearSelected(),
  resetEndpoint: (method, path) =>
    selectedPresetActions.clearSelected(method, path),
  getEndpointState: (method, path) =>
    selectedPresetActions.getSelected(method, path),
};
