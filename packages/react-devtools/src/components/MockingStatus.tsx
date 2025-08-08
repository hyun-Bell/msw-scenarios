'use client';import React from 'react';
import type { MockingState } from '../types';

interface MockingStatusProps {
  state: MockingState;
}

export function MockingStatus({ state }: MockingStatusProps) {
  const { enabled, activePresets, activeProfile } = state;

  return (
    <div className="flex items-center space-x-3">
      {/* Mocking Enabled/Disabled Status */}
      <div className="flex items-center space-x-2">
        <div
          className={`w-2 h-2 rounded-full ${
            enabled ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
        <span className={`text-sm font-medium ${
          enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500'
        }`}>
          {enabled ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Active Presets Count */}
      {enabled && activePresets.length > 0 && (
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {activePresets.length} preset{activePresets.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Active Profile */}
      {enabled && activeProfile && (
        <div className="flex items-center space-x-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            {activeProfile.name}
          </span>
        </div>
      )}
    </div>
  );
}