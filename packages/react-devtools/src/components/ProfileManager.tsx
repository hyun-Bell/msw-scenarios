import React, { useState } from 'react';
import { useProfileManager } from '../hooks/useProfileManager';
import type { ProfileInfo } from '../types';

export function ProfileManager() {
  const { profiles, activeProfile, switchProfile, createProfile, deleteProfile } = useProfileManager();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Mock Profiles
        </h3>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
        >
          Create Profile
        </button>
      </div>

      {/* Active Profile */}
      {activeProfile && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-blue-900 dark:text-blue-100">
              Active Profile
            </h4>
            <span className="text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
              {activeProfile.presets.length} presets
            </span>
          </div>
          <p className="text-blue-800 dark:text-blue-200 font-medium">
            {activeProfile.name}
          </p>
        </div>
      )}

      {/* Profiles List */}
      <div className="flex-1 overflow-auto">
        {profiles.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="mx-auto mb-4 opacity-50">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <p className="text-lg font-medium mb-2">No profiles created</p>
            <p className="text-sm">Create your first profile to group related API presets</p>
          </div>
        ) : (
          <div className="space-y-3">
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.name}
                profile={profile}
                isActive={activeProfile?.name === profile.name}
                onActivate={() => switchProfile(profile.name)}
                onDelete={() => deleteProfile(profile.name)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Profile Dialog */}
      {showCreateDialog && (
        <CreateProfileDialog
          onClose={() => setShowCreateDialog(false)}
          onCreate={(name) => {
            createProfile(name);
            setShowCreateDialog(false);
          }}
        />
      )}
    </div>
  );
}

interface ProfileCardProps {
  profile: ProfileInfo;
  isActive: boolean;
  onActivate: () => void;
  onDelete: () => void;
}

function ProfileCard({ profile, isActive, onActivate, onDelete }: ProfileCardProps) {
  return (
    <div
      className={`p-4 border rounded-lg transition-all cursor-pointer ${
        isActive
          ? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
      onClick={onActivate}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className={`font-medium ${
              isActive ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
            }`}>
              {profile.name}
            </h4>
            {isActive && (
              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>{profile.presets.length} presets</span>
            <span>•</span>
            <span>
              {profile.presets.filter(p => p.active).length} active
            </span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
          title="Delete profile"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

interface CreateProfileDialogProps {
  onClose: () => void;
  onCreate: (name: string) => void;
}

function CreateProfileDialog({ onClose, onCreate }: CreateProfileDialogProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Create New Profile
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Profile Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Empty State, Error Scenarios"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}