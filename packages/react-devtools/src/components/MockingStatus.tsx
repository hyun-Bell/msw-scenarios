'use client';
import React from 'react';
import type { MockingState } from '../types';

interface MockingStatusProps {
  state: MockingState;
}

export function MockingStatus({ state }: MockingStatusProps) {
  const { enabled, activePresets } = state;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      {/* Mocking Enabled/Disabled Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: enabled ? '#22c55e' : '#9ca3af',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: enabled ? '#16a34a' : '#6b7280',
          }}
        >
          {enabled ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Active Presets Count */}
      {enabled && activePresets.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>
            {activePresets.length} preset{activePresets.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Active Profile */}
      {enabled && state.activeProfile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ color: '#f59e0b' }}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>
            {state.activeProfile.name}
          </span>
        </div>
      )}
    </div>
  );
}
