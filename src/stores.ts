// Stores to keep track of presets and selected responses.
export const presetStore = new Map<
  string,
  { label: string; status: number; response: any }[]
>();

export const selectedPresetStore = new Map<string, SelectedPreset>();

export type SelectedPreset<T = any> = {
  preset: { label: string; status: number; response: T };
  override?: (draft: { data: T }) => void;
};
