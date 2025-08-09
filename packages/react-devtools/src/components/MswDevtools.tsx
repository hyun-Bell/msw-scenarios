import { useEffect, useState } from 'react';
import { useMockingState } from '../hooks/useMockingState';
import { injectStyles } from '../styles/inject';
import { styles } from '../styles/styles';
import type { DevtoolsProps } from '../types';
import { ApiLoggerRuntime } from './ApiLoggerRuntime';
import { MockingStatus } from './MockingStatus';
import { PresetSelectorRuntime } from './PresetSelectorRuntimeFixed';
import { ProfileManagerRuntime } from './ProfileManagerRuntime';

export function MswDevtools({
  position = 'bottom-right',
  defaultOpen = false,
  enableKeyboardShortcuts = true,
}: DevtoolsProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState<'presets' | 'profiles' | 'logs'>(
    'presets'
  );
  const mockingState = useMockingState();

  // Inject CSS animations
  useEffect(() => {
    const cleanup = injectStyles();
    return cleanup;
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + M to toggle devtools
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key === 'M'
      ) {
        event.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts]);

  // Get position styles
  const getPositionStyle = () => {
    switch (position) {
      case 'bottom-left':
        return styles.floatingButtonBottomLeft;
      case 'top-right':
        return styles.floatingButtonTopRight;
      case 'top-left':
        return styles.floatingButtonTopLeft;
      default:
        return styles.floatingButtonBottomRight;
    }
  };

  return (
    <div style={styles.devtoolsContainer}>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            ...styles.floatingButton,
            ...getPositionStyle(),
          }}
          className="msw-devtools-btn msw-devtools-button-enter"
          title="Open MSW DevTools (Ctrl+Shift+M)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </button>
      )}

      {/* Sheet Modal */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            style={styles.overlay}
            className="msw-devtools-overlay-enter"
            onClick={() => setIsOpen(false)}
          />

          {/* Sheet Content */}
          <div style={styles.sheetContent} className="msw-devtools-sheet-enter">
            {/* Drag Handle */}
            <div
              style={styles.dragHandle}
              className="msw-devtools-drag-handle"
            />

            {/* Header */}
            <div style={styles.sheetHeader}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <h2 style={styles.sheetTitle}>MSW DevTools</h2>
                <MockingStatus state={mockingState} />
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={styles.closeButton}
                className="msw-devtools-close-btn"
                aria-label="Close DevTools"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            {/* Tab Navigation */}
            <div style={styles.tabNavigation}>
              {[
                { key: 'presets' as const, label: 'Presets', icon: '⚙️' },
                { key: 'profiles' as const, label: 'Profiles', icon: '👥' },
                { key: 'logs' as const, label: 'API Logs', icon: '📋' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    ...styles.tabButton,
                    ...(activeTab === tab.key ? styles.tabButtonActive : {}),
                  }}
                  className="msw-devtools-tab-btn"
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={styles.contentArea}>
              {activeTab === 'presets' && <PresetSelectorRuntime />}
              {activeTab === 'profiles' && <ProfileManagerRuntime />}
              {activeTab === 'logs' && <ApiLoggerRuntime />}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
