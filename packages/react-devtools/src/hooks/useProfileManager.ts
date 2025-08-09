'use client';
import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useCoreIntegration } from './useCoreIntegration';
import type { ProfileInfo, PresetInfo } from '../types';
import type { StorageData } from '../utils/storage';

interface UseProfileManagerReturn {
  profiles: ProfileInfo[];
  activeProfile: ProfileInfo | null;
  switchProfile: (profileName: string) => void;
  createProfile: (
    name: string,
    fromActivePresets?: PresetInfo[]
  ) => ProfileInfo;
  deleteProfile: (name: string) => void;
  editProfile: (oldName: string, newName: string) => void;
  duplicateProfile: (profileName: string) => ProfileInfo | null;
  exportProfile: (profileName: string) => string | null;
  importProfile: (jsonString: string) => boolean;
}

export function useProfileManager(): UseProfileManagerReturn {
  const {
    isConnected,
    getProfiles,
    setActiveProfile: coreSwitchProfile,
  } = useCoreIntegration();
  const [storedProfiles, setStoredProfiles] = useLocalStorage(
    'profiles',
    [] as StorageData['profiles']
  );
  const [storedActiveProfile, setStoredActiveProfile] = useLocalStorage(
    'activeProfile',
    null as StorageData['activeProfile']
  );

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
        active: true,
      },
      {
        id: 'posts-success',
        label: 'Posts Success',
        method: 'GET',
        path: '/api/posts',
        status: 200,
        active: true,
      },
    ];

    const mockProfiles: ProfileInfo[] = [
      {
        name: 'Happy Path',
        active: false,
        presets: [
          { ...mockPresets[0], active: true },
          { ...mockPresets[1], active: true },
        ],
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
            active: true,
          },
          {
            id: 'posts-empty',
            label: 'Posts List Empty',
            method: 'GET',
            path: '/api/posts',
            status: 200,
            active: true,
          },
        ],
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
            active: true,
          },
          {
            id: 'posts-error',
            label: 'Posts Server Error',
            method: 'GET',
            path: '/api/posts',
            status: 500,
            active: true,
          },
        ],
      },
    ];

    setProfiles(mockProfiles);
    setActiveProfile(mockProfiles.find((p) => p.active) || null);
  }, []);

  const switchProfile = useCallback(
    (profileName: string) => {
      const profile = profiles.find((p) => p.name === profileName);
      if (!profile) return;

      // Update active profile
      setProfiles((prev) =>
        prev.map((p) => ({ ...p, active: p.name === profileName }))
      );
      setActiveProfile({ ...profile, active: true });

      // Save to localStorage
      setStoredActiveProfile(profileName);

      // Sync with core if connected
      if (isConnected) {
        coreSwitchProfile(profileName);
      }

      console.log(`Switched to profile: ${profileName}`);
    },
    [profiles, isConnected, coreSwitchProfile, setStoredActiveProfile]
  );

  const createProfile = useCallback(
    (name: string, fromActivePresets?: PresetInfo[]) => {
      const newProfile: ProfileInfo = {
        name,
        active: false,
        presets: fromActivePresets || [],
      };

      const updatedProfiles = [...profiles, newProfile];
      setProfiles(updatedProfiles);

      // Save to localStorage
      const storageProfiles = updatedProfiles.map((p) => ({
        name: p.name,
        presets: p.presets.map((preset) => preset.id),
      }));
      setStoredProfiles(storageProfiles);

      console.log(`Created profile: ${name}`);
      return newProfile;
    },
    [profiles, setStoredProfiles]
  );

  const deleteProfile = useCallback(
    (name: string) => {
      // Don't delete if it's the active profile
      if (activeProfile?.name === name) {
        setActiveProfile(null);
        setStoredActiveProfile(null);
      }

      const updatedProfiles = profiles.filter((p) => p.name !== name);
      setProfiles(updatedProfiles);

      // Save to localStorage
      const storageProfiles = updatedProfiles.map((p) => ({
        name: p.name,
        presets: p.presets.map((preset) => preset.id),
      }));
      setStoredProfiles(storageProfiles);

      console.log(`Deleted profile: ${name}`);
    },
    [activeProfile, profiles, setStoredProfiles, setStoredActiveProfile]
  );

  const editProfile = useCallback(
    (oldName: string, newName: string) => {
      const updatedProfiles = profiles.map((p) =>
        p.name === oldName ? { ...p, name: newName } : p
      );
      setProfiles(updatedProfiles);

      // Update active profile if it was renamed
      if (activeProfile?.name === oldName) {
        setActiveProfile({ ...activeProfile, name: newName });
        setStoredActiveProfile(newName);
      }

      // Save to localStorage
      const storageProfiles = updatedProfiles.map((p) => ({
        name: p.name,
        presets: p.presets.map((preset) => preset.id),
      }));
      setStoredProfiles(storageProfiles);

      console.log(`Renamed profile: ${oldName} -> ${newName}`);
    },
    [profiles, activeProfile, setStoredProfiles, setStoredActiveProfile]
  );

  const duplicateProfile = useCallback(
    (profileName: string) => {
      const profile = profiles.find((p) => p.name === profileName);
      if (!profile) return null;

      const newName = `${profile.name} (Copy)`;
      return createProfile(newName, profile.presets);
    },
    [profiles, createProfile]
  );

  const exportProfile = useCallback(
    (profileName: string): string | null => {
      const profile = profiles.find((p) => p.name === profileName);
      if (!profile) return null;

      return JSON.stringify(profile, null, 2);
    },
    [profiles]
  );

  const importProfile = useCallback(
    (jsonString: string): boolean => {
      try {
        const profile = JSON.parse(jsonString) as ProfileInfo;
        createProfile(profile.name, profile.presets);
        return true;
      } catch (error) {
        console.error('Failed to import profile:', error);
        return false;
      }
    },
    [createProfile]
  );

  return {
    profiles,
    activeProfile,
    switchProfile,
    createProfile,
    deleteProfile,
    editProfile,
    duplicateProfile,
    exportProfile,
    importProfile,
  };
}
