'use client';
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useContext,
} from 'react';
import { useMockClient, useMockClientPresets } from '../hooks/useMockClient';
import { useSearchFilters } from '../hooks/useLocalStorage';
import { debounce } from '../utils/storage';
import type { PresetInfo } from '../types';

// Import Toast context directly
import { ToastContext } from '../components/ui/Toast';

// Safe toast hook that works with or without ToastProvider
function useSafeToast() {
  const context = useContext(ToastContext);
  if (context) {
    return context;
  }
  // Fallback when not in ToastProvider
  return {
    toasts: [],
    addToast: (toast: any) => {
      console.log('Toast:', toast.title, toast.description);
    },
    removeToast: () => {},
  };
}

export function PresetSelector() {
  const { client } = useMockClient();
  const {
    presets: allPresets,
    togglePreset: togglePresetById,
    clearAllPresets,
  } = useMockClientPresets(client);

  // Convert presets to PresetInfo format
  const presets: PresetInfo[] = allPresets.map((p) => ({
    id: p.id,
    label: p.label,
    method: p.method,
    path: p.path,
    status: p.status,
    active: p.active,
  }));

  const activePresets = presets.filter((p) => p.active);

  const { filters, setFilters } = useSearchFilters();
  const { addToast } = useSafeToast();

  const [localSearchTerm, setLocalSearchTerm] = useState(filters.searchTerm);
  const [filterMethod, setFilterMethod] = useState<string>(
    filters.filterMethod
  );
  const [selectedPresets, setSelectedPresets] = useState<Set<string>>(
    new Set()
  );
  const [groupByEndpoint, setGroupByEndpoint] = useState(true);

  // Debounced search update
  const debouncedSearchUpdate = useCallback(
    debounce((term: string) => {
      setFilters({ ...filters, searchTerm: term });
    }, 500),
    [filters, setFilters]
  );

  useEffect(() => {
    debouncedSearchUpdate(localSearchTerm);
  }, [localSearchTerm, debouncedSearchUpdate]);

  useEffect(() => {
    setFilters({ ...filters, filterMethod });
  }, [filterMethod]);

  const filteredPresets = useMemo(() => {
    return presets.filter((preset) => {
      const matchesSearch =
        preset.path.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
        preset.label.toLowerCase().includes(localSearchTerm.toLowerCase());
      const matchesMethod =
        filterMethod === 'all' ||
        preset.method.toLowerCase() === filterMethod.toLowerCase();
      return matchesSearch && matchesMethod;
    });
  }, [presets, localSearchTerm, filterMethod]);

  const groupedPresets = useMemo(() => {
    if (!groupByEndpoint) return { ungrouped: filteredPresets };

    return filteredPresets.reduce(
      (acc, preset) => {
        const key = `${preset.method} ${preset.path}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(preset);
        return acc;
      },
      {} as Record<string, PresetInfo[]>
    );
  }, [filteredPresets, groupByEndpoint]);

  const methods = useMemo(
    () => [...new Set(presets.map((p) => p.method))],
    [presets]
  );

  const handleTogglePreset = useCallback(
    (preset: PresetInfo) => {
      togglePresetById(preset.id);
      const isActivating = !activePresets.some((p) => p.id === preset.id);

      if (addToast) {
        addToast({
          type: 'success',
          title: isActivating ? 'Preset Activated' : 'Preset Deactivated',
          description: `${preset.method} ${preset.path} - ${preset.label}`,
          duration: 2000,
        });
      }
    },
    [togglePresetById, activePresets, addToast]
  );

  const handleSelectAll = useCallback(() => {
    const allFilteredIds = new Set(filteredPresets.map((p) => p.id));
    setSelectedPresets(allFilteredIds);
  }, [filteredPresets]);

  const handleDeselectAll = useCallback(() => {
    setSelectedPresets(new Set());
  }, []);

  const handleToggleSelected = useCallback(() => {
    selectedPresets.forEach((id) => {
      togglePresetById(id);
    });
    if (addToast) {
      addToast({
        type: 'success',
        title: 'Bulk Action Complete',
        description: `${selectedPresets.size} presets updated`,
      });
    }
    setSelectedPresets(new Set());
  }, [selectedPresets, togglePresetById, addToast]);

  const handleClearAll = useCallback(() => {
    clearAllPresets();
    if (addToast) {
      addToast({
        type: 'info',
        title: 'All Presets Cleared',
        description: 'All active presets have been deactivated',
      });
    }
  }, [clearAllPresets, addToast]);

  return (
    <div className="p-4 h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Search and Filter Bar */}
      <div className="space-y-1 mb-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search presets..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="w-full pl-7 pr-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <svg
              className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Methods</option>
            {methods.map((method) => (
              <option key={method} value={method}>
                {method.toUpperCase()}
              </option>
            ))}
          </select>
          <button
            onClick={() => setGroupByEndpoint(!groupByEndpoint)}
            className={`px-2 py-1.5 rounded-md border transition-colors ${
              groupByEndpoint
                ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
            }`}
            title="Group by endpoint"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Bulk Actions Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Select All
            </button>
            <span className="text-gray-400">•</span>
            <button
              onClick={handleDeselectAll}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Deselect All
            </button>
            {selectedPresets.size > 0 && (
              <>
                <span className="text-gray-400">•</span>
                <button
                  onClick={handleToggleSelected}
                  className="text-sm text-green-600 dark:text-green-400 hover:underline"
                >
                  Toggle {selectedPresets.size} Selected
                </button>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {activePresets.length} of {presets.length} active
            </span>
            <button
              onClick={handleClearAll}
              className="px-3 py-1 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Presets List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {!client ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
            <svg
              className="w-12 h-12 mb-4 opacity-50 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p>Connecting to MSW...</p>
          </div>
        ) : Object.keys(groupedPresets).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
            <svg
              className="w-12 h-12 mb-4 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {presets.length === 0
              ? 'No presets available'
              : 'No presets match your search'}
          </div>
        ) : (
          Object.entries(groupedPresets).map(([endpoint, endpointPresets]) => (
            <div key={endpoint} className="space-y-2">
              {groupByEndpoint && endpoint !== 'ungrouped' && (
                <div className="sticky top-0 bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm px-2 py-1 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {endpoint}
                  </h3>
                </div>
              )}
              {endpointPresets.map((preset) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  isActive={activePresets.some((p) => p.id === preset.id)}
                  isSelected={selectedPresets.has(preset.id)}
                  onToggle={() => handleTogglePreset(preset)}
                  onSelect={(selected) => {
                    const newSelected = new Set(selectedPresets);
                    if (selected) {
                      newSelected.add(preset.id);
                    } else {
                      newSelected.delete(preset.id);
                    }
                    setSelectedPresets(newSelected);
                  }}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface PresetCardProps {
  preset: PresetInfo;
  isActive: boolean;
  isSelected: boolean;
  onToggle: () => void;
  onSelect: (selected: boolean) => void;
}

function PresetCard({
  preset,
  isActive,
  isSelected,
  onToggle,
  onSelect,
}: PresetCardProps) {
  const getMethodBadgeColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return '#10b981';
      case 'POST':
        return '#3b82f6';
      case 'PUT':
        return '#f59e0b';
      case 'PATCH':
        return '#8b5cf6';
      case 'DELETE':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return '#10b981';
    if (status >= 400) return '#ef4444';
    return '#6b7280';
  };

  return (
    <div
      className={`group relative p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
        isActive
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
      } ${isSelected ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Selection Checkbox */}
        <div className="pt-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect(e.target.checked);
            }}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
        </div>

        {/* Content */}
        <div className="flex-1" onClick={onToggle}>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="px-2 py-0.5 text-xs font-semibold text-white rounded"
              style={{ backgroundColor: getMethodBadgeColor(preset.method) }}
            >
              {preset.method}
            </span>
            <span
              className="px-2 py-0.5 text-xs font-semibold text-white rounded"
              style={{ backgroundColor: getStatusColor(preset.status) }}
            >
              {preset.status}
            </span>
            {isActive && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                Active
              </span>
            )}
          </div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {preset.label}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
            {preset.path}
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="pt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isActive ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
