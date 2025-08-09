import { useState } from 'react';
import { useMockingState } from '../hooks/useMockingState';
import { profileManagerStyles as styles } from '../styles/profileManager';

interface Profile {
  name: string;
  presets: Array<{
    id: string;
    method: string;
    path: string;
    preset: string;
  }>;
}

export function ProfileManagerRuntime() {
  const mockingState = useMockingState();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<string | null>(null);
  const [newProfileName, setNewProfileName] = useState('');
  const [hoveredProfile, setHoveredProfile] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState(false);

  // Get active presets from mockingState
  const getActivePresets = () => {
    // Get active presets from the mocking state
    return (
      mockingState?.activePresets?.map((preset) => ({
        id: preset.id,
        method: preset.method,
        path: preset.path,
        preset: preset.label,
      })) || []
    );
  };

  const handleCreateProfile = () => {
    if (!newProfileName.trim()) return;

    // Create profile with current presets
    const activePresets = getActivePresets();
    const newProfile: Profile = {
      name: newProfileName,
      presets: activePresets,
    };
    setProfiles([...profiles, newProfile]);
    setNewProfileName('');
  };

  const handleApplyProfile = (profileName: string) => {
    setActiveProfile(profileName);
    // In a real implementation, this would apply the presets
    const profile = profiles.find((p) => p.name === profileName);
    if (profile) {
      console.log('Applying profile:', profile);
      // Would need to integrate with MockClient to actually apply presets
    }
  };

  const handleDeleteProfile = (profileName: string) => {
    setProfiles(profiles.filter((p) => p.name !== profileName));
    if (activeProfile === profileName) {
      setActiveProfile(null);
    }
  };

  const handleUpdateProfile = (profileName: string) => {
    const activePresets = getActivePresets();
    setProfiles(
      profiles.map((p) =>
        p.name === profileName ? { ...p, presets: activePresets } : p
      )
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Mock Profiles</h3>
        <p style={styles.subtitle}>
          Save and switch between different preset combinations
        </p>
      </div>

      {profiles.length > 0 ? (
        <div style={styles.profilesList}>
          {profiles.map((profile) => {
            const isActive = profile.name === activeProfile;
            const isHovered = hoveredProfile === profile.name;

            return (
              <div
                key={profile.name}
                style={{
                  ...styles.profileCard(isActive),
                  ...(isHovered && !isActive ? styles.profileCardHover : {}),
                }}
                onMouseEnter={() => setHoveredProfile(profile.name)}
                onMouseLeave={() => setHoveredProfile(null)}
                onClick={() => !isActive && handleApplyProfile(profile.name)}
              >
                <div style={styles.profileHeader}>
                  <div style={styles.profileInfo}>
                    <div style={styles.profileName}>{profile.name}</div>
                    <div style={styles.profileStatus}>
                      <div style={styles.statusDot(isActive)} />
                      <span style={styles.statusText}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div style={styles.profileActions}>
                    <button
                      style={{
                        ...styles.actionButton,
                        ...(hoveredButton === `update-${profile.name}`
                          ? styles.actionButtonHover
                          : {}),
                      }}
                      onMouseEnter={() =>
                        setHoveredButton(`update-${profile.name}`)
                      }
                      onMouseLeave={() => setHoveredButton(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateProfile(profile.name);
                      }}
                      title="Update with current presets"
                    >
                      <svg
                        style={styles.actionIcon}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79s7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.5-3.47-3.53-9.11-.02-12.58s9.14-3.47 12.65 0L21 3v7.12zM12.5 8v4.25l3.5 2.08-.72 1.21L11 13V8h1.5z" />
                      </svg>
                    </button>
                    <button
                      style={{
                        ...styles.actionButton,
                        ...(hoveredButton === `delete-${profile.name}`
                          ? styles.actionButtonHover
                          : {}),
                      }}
                      onMouseEnter={() =>
                        setHoveredButton(`delete-${profile.name}`)
                      }
                      onMouseLeave={() => setHoveredButton(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProfile(profile.name);
                      }}
                      title="Delete profile"
                    >
                      <svg
                        style={styles.actionIcon}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div style={styles.profilePresets}>
                  {profile.presets.map((preset) => (
                    <div key={preset.id} style={styles.presetChip}>
                      {preset.method.toUpperCase()} {preset.path} →{' '}
                      {preset.preset}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <svg style={styles.emptyIcon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-4V7h2v6h-2z" />
          </svg>
          <div style={styles.emptyTitle}>No profiles yet</div>
          <div style={styles.emptyText}>
            Create your first profile to save and reuse preset combinations
          </div>
        </div>
      )}

      <div style={styles.createSection}>
        <div style={styles.createTitle}>Create New Profile</div>
        <div style={styles.createForm}>
          <input
            type="text"
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            onFocus={() => setFocusedInput(true)}
            onBlur={() => setFocusedInput(false)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateProfile();
              }
            }}
            placeholder="Enter profile name..."
            style={{
              ...styles.createInput,
              ...(focusedInput ? styles.createInputFocus : {}),
            }}
          />
          <button
            onClick={handleCreateProfile}
            disabled={!newProfileName.trim()}
            style={{
              ...styles.createButton,
              ...(hoveredButton === 'create' ? styles.createButtonHover : {}),
              ...(!newProfileName.trim()
                ? { opacity: 0.5, cursor: 'not-allowed' }
                : {}),
            }}
            onMouseEnter={() => setHoveredButton('create')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            Create Profile
          </button>
        </div>
      </div>
    </div>
  );
}
