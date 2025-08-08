export interface PresetInfo {
  id: string;
  label: string;
  method: string;
  path: string;
  status: number;
  active: boolean;
}

export interface ProfileInfo {
  name: string;
  active: boolean;
  presets: PresetInfo[];
}

export interface DevtoolsProps {
  /**
   * Position of the devtools panel
   * @default 'bottom-right'
   */
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';

  /**
   * Default open state
   * @default false
   */
  defaultOpen?: boolean;

  /**
   * Enable keyboard shortcuts
   * @default true
   */
  enableKeyboardShortcuts?: boolean;

  /**
   * Custom theme
   */
  theme?: 'light' | 'dark' | 'auto';
}

export interface MockingState {
  enabled: boolean;
  activePresets: PresetInfo[];
  activeProfile?: ProfileInfo;
  recentApiCalls: ApiCall[];
}

export interface ApiCall {
  id: string;
  timestamp: number;
  method: string;
  path: string;
  status: number;
  preset?: string;
  duration: number;
}
