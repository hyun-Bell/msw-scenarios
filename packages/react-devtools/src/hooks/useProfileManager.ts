import { useState, useEffect } from 'react';
import type { ProfileInfo, PresetInfo } from '../types';

interface UseProfileManagerReturn {
  profiles: ProfileInfo[];
  activeProfile: ProfileInfo | null;
  switchProfile: (profileName: string) => void;
  createProfile: (name: string) => void;
  deleteProfile: (name: string) => void;
}

export function useProfileManager(): UseProfileManagerReturn {
  const [profiles, setProfiles] = useState<ProfileInfo[]>([]);
  const [activeProfile, setActiveProfile] = useState<ProfileInfo | null>(null);

  useEffect(() => {
    // Mock profiles - in real app, this would fetch from @msw-scenarios/core
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
        id: 'posts-success',
        label: 'Posts Success', 
        method: 'GET',
        path: '/api/posts',
        status: 200,
        active: true
      }
    ];

    const mockProfiles: ProfileInfo[] = [
      {
        name: 'Happy Path',
        active: false,
        presets: [
          { ...mockPresets[0], active: true },
          { ...mockPresets[1], active: true }
        ]
      },
      {
        name: 'Empty State',
        active: false,
        presets: [
          {
            id: 'user-empty',
            label: 'User List Empty',
            method: 'GET',
            path: '/api/users',
            status: 200,
            active: true
          },
          {
            id: 'posts-empty',
            label: 'Posts List Empty',
            method: 'GET', 
            path: '/api/posts',
            status: 200,
            active: true
          }
        ]
      },
      {
        name: 'Error Scenarios',
        active: true,
        presets: [
          {
            id: 'user-error',
            label: 'User Server Error',
            method: 'GET',
            path: '/api/users', 
            status: 500,
            active: true
          },
          {
            id: 'posts-error',
            label: 'Posts Server Error',
            method: 'GET',
            path: '/api/posts',
            status: 500, 
            active: true
          }
        ]
      }
    ];

    setProfiles(mockProfiles);
    setActiveProfile(mockProfiles.find(p => p.active) || null);
  }, []);

  const switchProfile = (profileName: string) => {
    const profile = profiles.find(p => p.name === profileName);
    if (!profile) return;

    // Update active profile
    setProfiles(prev => 
      prev.map(p => ({ ...p, active: p.name === profileName }))
    );
    setActiveProfile({ ...profile, active: true });

    // In real app, this would call @msw-scenarios/core:
    // mockProfiles.useMock(profileName);
    console.log(`Switched to profile: ${profileName}`);
  };

  const createProfile = (name: string) => {
    const newProfile: ProfileInfo = {
      name,
      active: false,
      presets: []
    };

    setProfiles(prev => [...prev, newProfile]);

    // In real app, this would call @msw-scenarios/core:
    // const profiles = extendedHandlers.createMockProfiles(
    //   { name, actions: ({useMock}) => { /* configure presets */ } }
    // );
    console.log(`Created profile: ${name}`);
  };

  const deleteProfile = (name: string) => {
    // Don't delete if it's the active profile
    if (activeProfile?.name === name) {
      setActiveProfile(null);
    }

    setProfiles(prev => prev.filter(p => p.name !== name));

    // In real app, this would call @msw-scenarios/core to cleanup
    console.log(`Deleted profile: ${name}`);
  };

  return {
    profiles,
    activeProfile,
    switchProfile,
    createProfile,
    deleteProfile
  };
}