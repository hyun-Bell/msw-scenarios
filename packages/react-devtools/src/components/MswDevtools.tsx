
import React, { useState, useEffect } from 'react';
import { BottomSheet } from './BottomSheet';
import { MockingStatus } from './MockingStatus';
import { PresetSelector } from './PresetSelector';
import { ProfileManager } from './ProfileManager';
import { ApiLogger } from './ApiLogger';
import { useMockingState } from '../hooks/useMockingState';
import type { DevtoolsProps } from '../types';

export function MswDevtools({
  position = 'bottom-right',
  defaultOpen = false,
  enableKeyboardShortcuts = true,
  theme = 'auto'
}: DevtoolsProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState<'presets' | 'profiles' | 'logs'>('presets');
  const mockingState = useMockingState();

  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + M to toggle devtools
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'M') {
        event.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, enableKeyboardShortcuts]);

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <div className={`fixed z-50 ${getPositionClass(position)}`}>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            title="Open MSW DevTools (Ctrl+Shift+M)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </button>
        </div>
      )}

      {/* Main DevTools Panel */}
      {isOpen && (
        <BottomSheet onClose={() => setIsOpen(false)}>
          <div className="h-full flex flex-col bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  MSW DevTools
                </h2>
                <MockingStatus state={mockingState} />
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {[
                { key: 'presets', label: 'Presets' },
                { key: 'profiles', label: 'Profiles' },
                { key: 'logs', label: 'API Logs' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'presets' && <PresetSelector />}
              {activeTab === 'profiles' && <ProfileManager />}
              {activeTab === 'logs' && <ApiLogger />}
            </div>
          </div>
        </BottomSheet>
      )}
    </>
  );
}

function getPositionClass(position: DevtoolsProps['position']): string {
  const positions = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };
  return positions[position || 'bottom-right'];
}