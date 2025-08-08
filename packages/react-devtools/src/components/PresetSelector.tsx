'use client';import React, { useState } from 'react';
import { usePresetManager } from '../hooks/usePresetManager';
import type { PresetInfo } from '../types';

export function PresetSelector() {
  const { presets, activePresets, togglePreset, clearAllPresets } = usePresetManager();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('all');

  const filteredPresets = presets.filter(preset => {
    const matchesSearch = preset.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         preset.label.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = filterMethod === 'all' || preset.method.toLowerCase() === filterMethod.toLowerCase();
    return matchesSearch && matchesMethod;
  });

  const methods = [...new Set(presets.map(p => p.method))];

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Search and Filter */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search presets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterMethod}
          onChange={(e) => setFilterMethod(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="all">All Methods</option>
          {methods.map(method => (
            <option key={method} value={method}>{method.toUpperCase()}</option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {activePresets.length} of {presets.length} active
        </div>
        <button
          onClick={clearAllPresets}
          className="px-3 py-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-300 dark:border-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          Clear All
        </button>
      </div>

      {/* Presets List */}
      <div className="flex-1 overflow-auto space-y-2">
        {filteredPresets.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            {presets.length === 0 ? 'No presets available' : 'No presets match your search'}
          </div>
        ) : (
          filteredPresets.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              isActive={activePresets.some(p => p.id === preset.id)}
              onToggle={() => togglePreset(preset)}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface PresetCardProps {
  preset: PresetInfo;
  isActive: boolean;
  onToggle: () => void;
}

function PresetCard({ preset, isActive, onToggle }: PresetCardProps) {
  const methodColors: Record<string, string> = {
    GET: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    POST: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    PUT: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    PATCH: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  const statusColors: Record<number, string> = {
    200: 'text-green-600 dark:text-green-400',
    201: 'text-green-600 dark:text-green-400',
    400: 'text-orange-600 dark:text-orange-400',
    401: 'text-orange-600 dark:text-orange-400',
    403: 'text-red-600 dark:text-red-400',
    404: 'text-red-600 dark:text-red-400',
    500: 'text-red-600 dark:text-red-400',
  };

  return (
    <div
      className={`p-3 border rounded-lg cursor-pointer transition-all ${
        isActive
          ? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
      onClick={onToggle}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-1 text-xs font-semibold rounded ${
              methodColors[preset.method] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}>
              {preset.method}
            </span>
            <span className={`text-sm font-mono ${
              statusColors[preset.status] || 'text-gray-600 dark:text-gray-400'
            }`}>
              {preset.status}
            </span>
          </div>
          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {preset.label}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
            {preset.path}
          </div>
        </div>
        <div className={`ml-3 w-5 h-5 rounded-full flex items-center justify-center ${
          isActive ? 'bg-blue-600' : 'border-2 border-gray-300 dark:border-gray-600'
        }`}>
          {isActive && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}