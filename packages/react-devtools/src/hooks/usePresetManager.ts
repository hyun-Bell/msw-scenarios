'use client';import { useState, useEffect } from 'react';
import type { PresetInfo } from '../types';

interface UsePresetManagerReturn {
  presets: PresetInfo[];
  activePresets: PresetInfo[];
  togglePreset: (preset: PresetInfo) => void;
  clearAllPresets: () => void;
  refreshPresets: () => void;
}

export function usePresetManager(): UsePresetManagerReturn {
  const [presets, setPresets] = useState<PresetInfo[]>([]);
  const [activePresets, setActivePresets] = useState<PresetInfo[]>([]);

  useEffect(() => {
    // Mock presets - in real app, this would fetch from @msw-scenarios/core
    const mockPresets: PresetInfo[] = [
      {
        id: 'user-list-success',
        label: 'User List Success',
        method: 'GET',
        path: '/api/users',
        status: 200,
        active: true
      },
      {
        id: 'user-list-empty',
        label: 'User List Empty',
        method: 'GET',
        path: '/api/users',
        status: 200,
        active: false
      },
      {
        id: 'user-list-error',
        label: 'User List Server Error',
        method: 'GET',
        path: '/api/users',
        status: 500,
        active: false
      },
      {
        id: 'user-create-success',
        label: 'Create User Success',
        method: 'POST',
        path: '/api/users',
        status: 201,
        active: false
      },
      {
        id: 'user-create-validation',
        label: 'Create User Validation Error',
        method: 'POST',
        path: '/api/users',
        status: 400,
        active: false
      },
      {
        id: 'user-detail-success',
        label: 'User Detail Success',
        method: 'GET',
        path: '/api/users/:id',
        status: 200,
        active: false
      },
      {
        id: 'user-detail-not-found',
        label: 'User Not Found',
        method: 'GET',
        path: '/api/users/:id',
        status: 404,
        active: false
      },
      {
        id: 'posts-success',
        label: 'Posts List Success',
        method: 'GET',
        path: '/api/posts',
        status: 200,
        active: false
      }
    ];

    setPresets(mockPresets);
    setActivePresets(mockPresets.filter(p => p.active));
  }, []);

  const togglePreset = (preset: PresetInfo) => {
    setPresets(prev => 
      prev.map(p => 
        p.id === preset.id ? { ...p, active: !p.active } : p
      )
    );
    
    setActivePresets(prev => {
      const isCurrentlyActive = prev.some(p => p.id === preset.id);
      if (isCurrentlyActive) {
        return prev.filter(p => p.id !== preset.id);
      } else {
        return [...prev, { ...preset, active: true }];
      }
    });

    // In real app, this would call @msw-scenarios/core methods:
    // extendedHandlers.useMock({ 
    //   method: preset.method.toLowerCase() as any,
    //   path: preset.path,
    //   preset: preset.label
    // });
  };

  const clearAllPresets = () => {
    setPresets(prev => prev.map(p => ({ ...p, active: false })));
    setActivePresets([]);

    // In real app, this would call @msw-scenarios/core:
    // extendedHandlers.clearAllMocks();
  };

  const refreshPresets = () => {
    // In real app, this would re-fetch from @msw-scenarios/core
    console.log('Refreshing presets...');
  };

  return {
    presets,
    activePresets,
    togglePreset,
    clearAllPresets,
    refreshPresets
  };
}