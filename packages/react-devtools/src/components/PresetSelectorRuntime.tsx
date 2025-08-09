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
import { presetSelectorStyles as styles } from '../styles/presetSelector';
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

export function PresetSelectorRuntime() {
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
  const [searchFocused, setSearchFocused] = useState(false);

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
    <div style={styles.container}>
      {/* Search and Filter Bar */}
      <div style={styles.searchSection}>
        <div style={styles.searchRow}>
          <div style={styles.searchInputWrapper}>
            <input
              type="text"
              placeholder="Search presets..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                ...styles.searchInput,
                ...(searchFocused ? styles.searchInputFocus : {}),
              }}
            />
            <svg
              style={styles.searchIcon}
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
            style={styles.filterSelect}
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
            style={styles.groupButton(groupByEndpoint)}
            title="Group by endpoint"
          >
            <svg
              style={{ width: '16px', height: '16px' }}
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
        <div style={styles.bulkActionsBar}>
          <div style={styles.bulkActionsLeft}>
            <button onClick={handleSelectAll} style={styles.linkButton}>
              Select All
            </button>
            <span style={styles.separator}>•</span>
            <button onClick={handleDeselectAll} style={styles.linkButton}>
              Deselect All
            </button>
            {selectedPresets.size > 0 && (
              <>
                <span style={styles.separator}>•</span>
                <button
                  onClick={handleToggleSelected}
                  style={{ ...styles.linkButton, color: '#10b981' }}
                >
                  Toggle {selectedPresets.size} Selected
                </button>
              </>
            )}
          </div>
          <div style={styles.bulkActionsRight}>
            <span style={styles.statusText}>
              {activePresets.length} of {presets.length} active
            </span>
            <button onClick={handleClearAll} style={styles.clearButton}>
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Presets List */}
      <div style={styles.presetsList}>
        {!client ? (
          <div style={styles.loadingContainer}>
            <svg style={styles.spinner} fill="none" viewBox="0 0 24 24">
              <circle
                style={{ opacity: 0.25 }}
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                style={{ opacity: 0.75 }}
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p style={styles.loadingText}>Connecting to MSW...</p>
          </div>
        ) : Object.keys(groupedPresets).length === 0 ? (
          <div style={styles.emptyState}>
            <svg
              style={styles.emptyIcon}
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
            <p style={styles.emptyText}>
              {presets.length === 0
                ? 'No presets available'
                : 'No presets match your search'}
            </p>
          </div>
        ) : (
          Object.entries(groupedPresets).map(([endpoint, endpointPresets]) => (
            <div key={endpoint} style={styles.presetsGroup}>
              {groupByEndpoint && endpoint !== 'ungrouped' && (
                <div style={styles.groupHeader}>
                  <h3 style={styles.groupTitle}>{endpoint}</h3>
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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        ...styles.presetCard(isActive, isSelected),
        ...(isHovered ? styles.presetCardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.presetCardContent}>
        {/* Selection Checkbox */}
        <div>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect(e.target.checked);
            }}
            style={styles.presetCheckbox}
          />
        </div>

        {/* Content */}
        <div style={styles.presetInfo} onClick={onToggle}>
          <div style={styles.presetBadges}>
            <span style={styles.methodBadge(preset.method)}>
              {preset.method}
            </span>
            <span style={styles.statusBadge(preset.status)}>
              {preset.status}
            </span>
            {isActive && <span style={styles.activeBadge}>Active</span>}
          </div>
          <h4 style={styles.presetLabel}>{preset.label}</h4>
          <p style={styles.presetPath}>{preset.path}</p>
        </div>

        {/* Toggle Switch */}
        <div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            style={styles.toggleSwitch(isActive)}
          >
            <span style={styles.toggleThumb(isActive)} />
          </button>
        </div>
      </div>
    </div>
  );
}
