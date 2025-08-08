import { useState, useEffect } from 'react';
import type { MockingState, PresetInfo, ProfileInfo, ApiCall } from '../types';

export function useMockingState(): MockingState {
  const [state, setState] = useState<MockingState>({
    enabled: true,
    activePresets: [],
    activeProfile: undefined,
    recentApiCalls: []
  });

  useEffect(() => {
    // Mock initial state - in real app, this would connect to @msw-scenarios/core
    const mockPresets: PresetInfo[] = [
      {
        id: 'user-success',
        label: 'User Success',
        method: 'GET',
        path: '/api/users',
        status: 200,
        active: true
      },
      {
        id: 'user-error',
        label: 'User Error',
        method: 'GET',
        path: '/api/users',
        status: 500,
        active: false
      }
    ];

    const mockProfile: ProfileInfo = {
      name: 'Development',
      active: true,
      presets: mockPresets.filter(p => p.active)
    };

    const mockApiCalls: ApiCall[] = [
      {
        id: '1',
        timestamp: Date.now() - 5000,
        method: 'GET',
        path: '/api/users',
        status: 200,
        preset: 'user-success',
        duration: 45
      }
    ];

    setState({
      enabled: true,
      activePresets: mockPresets.filter(p => p.active),
      activeProfile: mockProfile,
      recentApiCalls: mockApiCalls
    });
  }, []);

  // In a real implementation, this would:
  // 1. Subscribe to MSW state changes
  // 2. Listen for API calls
  // 3. Update preset/profile status
  // 4. Integrate with @msw-scenarios/core

  return state;
}