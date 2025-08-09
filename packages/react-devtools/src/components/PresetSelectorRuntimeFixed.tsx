import { useState, useMemo, useCallback, memo, useRef, useEffect } from 'react';
import { useMockClient } from '../hooks/useMockClient';
import { presetSelectorStyles as styles } from '../styles/presetSelector';

export const PresetSelectorRuntime = memo(function PresetSelectorRuntime() {
  const { client: mockClient, isConnected, isLoading } = useMockClient();
  const [search, setSearch] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [hoveredPreset, setHoveredPreset] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState(false);
  const [activePresets, setActivePresets] = useState<Map<string, string>>(new Map());
  
  // Use ref to track input element
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Static styles that never change
  const staticStyles = useMemo(() => ({
    container: styles.container,
    searchSection: styles.searchSection,
    searchRow: styles.searchRow,
    searchInputWrapper: styles.searchInputWrapper,
    searchIcon: styles.searchIcon,
    filterSelect: styles.filterSelect,
    presetsList: styles.presetsList,
    emptyState: styles.emptyState,
    emptyIcon: styles.emptyIcon,
    emptyTitle: styles.emptyTitle,
    emptyText: styles.emptyText,
    presetGroupHeader: styles.presetGroupHeader,
    presetGroupContent: styles.presetGroupContent,
    methodBadge: styles.methodBadge,
    presetEndpoint: styles.presetEndpoint,
    presetCardContent: styles.presetCardContent,
    presetCheckbox: styles.presetCheckbox,
    presetInfo: styles.presetInfo,
    presetLabel: styles.presetLabel,
    presetStatus: styles.presetStatus,
    activeBadge: styles.activeBadge,
    loadingContainer: styles.loadingContainer,
    loadingSpinner: styles.loadingSpinner,
    loadingText: styles.loadingText,
  }), []);

  // Compute search input style only when focus changes
  const searchInputStyle = useMemo(() => {
    const baseStyle = { ...styles.searchInput };
    if (focusedInput) {
      // Apply focus styles without conflicting properties
      return {
        ...baseStyle,
        ...styles.searchInputFocus,
      };
    }
    return baseStyle;
  }, [focusedInput]);

  // Get handlers from mockClient
  const handlers = useMemo(() => {
    if (!mockClient) return [];
    const allHandlers = mockClient.getHandlers();
    return allHandlers?.handlers || [];
  }, [mockClient]);

  // Subscribe to active preset changes
  useEffect(() => {
    if (!mockClient) return;
    
    const updateActivePresets = () => {
      const allPresets = mockClient.getAllPresets();
      const activeMap = new Map<string, string>();
      
      allPresets.forEach((preset: any) => {
        if (preset.active) {
          const key = `${preset.method.toLowerCase()}-${preset.path}`;
          activeMap.set(key, preset.label);
        }
      });
      
      setActivePresets(activeMap);
    };
    
    // Initial update
    updateActivePresets();
    
    // Subscribe to changes
    const unsubscribe = mockClient.subscribeToChanges(updateActivePresets);
    
    // Also listen for custom events
    const handleUpdate = () => updateActivePresets();
    window.addEventListener('msw-handlers-update', handleUpdate);
    
    return () => {
      unsubscribe();
      window.removeEventListener('msw-handlers-update', handleUpdate);
    };
  }, [mockClient]);

  // Filter handlers based on search and method
  const filteredHandlers = useMemo(() => {
    return handlers.filter((handler: any) => {
      const matchesSearch = !search || 
        handler._path.toLowerCase().includes(search.toLowerCase());
      const matchesMethod = selectedMethod === 'all' || 
        handler._method.toLowerCase() === selectedMethod.toLowerCase();
      return matchesSearch && matchesMethod;
    });
  }, [handlers, search, selectedMethod]);

  // Group handlers by endpoint
  const groupedHandlers = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredHandlers.forEach((handler: any) => {
      const key = `${handler._method}-${handler._path}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      if (handler._presets) {
        handler._presets.forEach((preset: any) => {
          groups[key].push({
            handler,
            preset,
          });
        });
      }
    });
    return groups;
  }, [filteredHandlers]);

  const handlePresetToggle = useCallback((method: string, path: string, presetLabel: string) => {
    if (!mockClient) return;
    
    const key = `${method}-${path}`;
    const currentActive = activePresets.get(key);
    
    if (currentActive === presetLabel) {
      // Reset to default
      mockClient.getState().resetEndpoint(method, path);
    } else {
      // Set new preset
      mockClient.setActivePreset(method, path, presetLabel);
    }
  }, [mockClient, activePresets]);

  const handleClearAll = useCallback(() => {
    if (!mockClient) return;
    mockClient.getState().resetAll();
  }, [mockClient]);

  if (isLoading) {
    return (
      <div style={staticStyles.container}>
        <div style={staticStyles.loadingContainer}>
          <div style={staticStyles.loadingSpinner} />
          <div style={staticStyles.loadingText}>Loading handlers...</div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div style={staticStyles.container}>
        <div style={staticStyles.emptyState}>
          <svg style={staticStyles.emptyIcon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <div style={staticStyles.emptyTitle}>Not Connected</div>
          <div style={staticStyles.emptyText}>
            Waiting for MSW connection...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={staticStyles.container}>
      <div style={staticStyles.searchSection}>
        <div style={staticStyles.searchRow}>
          <div style={staticStyles.searchInputWrapper}>
            <svg style={staticStyles.searchIcon} viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search endpoints..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setFocusedInput(true)}
              onBlur={() => setFocusedInput(false)}
              style={searchInputStyle}
            />
          </div>
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            style={staticStyles.filterSelect}
          >
            <option value="all">All Methods</option>
            <option value="get">GET</option>
            <option value="post">POST</option>
            <option value="put">PUT</option>
            <option value="patch">PATCH</option>
            <option value="delete">DELETE</option>
          </select>
          <button
            onClick={handleClearAll}
            style={styles.clearButton}
          >
            Clear All
          </button>
        </div>
      </div>

      {Object.keys(groupedHandlers).length > 0 ? (
        <div style={staticStyles.presetsList}>
          {Object.entries(groupedHandlers).map(([endpoint, items]) => {
            const [method, ...pathParts] = endpoint.split('-');
            const path = pathParts.join('-');
            const activePresetLabel = activePresets.get(`${method}-${path}`);
            const hasActivePreset = !!activePresetLabel;
            
            return (
              <div key={endpoint} style={styles.presetsGroup}>
                <div style={{
                  ...staticStyles.presetGroupHeader,
                  ...(hasActivePreset ? styles.activeGroupHeader : {})
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={styles.methodBadge(method)}>{method.toUpperCase()}</span>
                    <span style={staticStyles.presetEndpoint}>{path}</span>
                  </div>
                  {hasActivePreset && (
                    <div style={styles.activeGroupIndicator}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="4" />
                      </svg>
                      <span style={{ fontSize: '11px', marginLeft: '4px' }}>Active</span>
                    </div>
                  )}
                </div>
                <div style={staticStyles.presetGroupContent}>
                  {items.map(({ handler, preset }: any, index: number) => {
                    const isActive = activePresetLabel === preset.label;
                    const presetKey = `${endpoint}-${preset.label}-${index}`;
                    const isHovered = hoveredPreset === presetKey;

                    // Compute preset card style directly without useMemo
                    const baseStyle = styles.presetCard(isActive, false);
                    const presetCardStyle = isHovered && !isActive 
                      ? { ...baseStyle, ...styles.presetCardHover }
                      : baseStyle;

                    return (
                      <div
                        key={presetKey}
                        style={presetCardStyle}
                        onMouseEnter={() => setHoveredPreset(presetKey)}
                        onMouseLeave={() => setHoveredPreset(null)}
                        onClick={() => handlePresetToggle(method, path, preset.label)}
                      >
                        <div style={staticStyles.presetCardContent}>
                          <div style={staticStyles.presetInfo}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {isActive && (
                                  <div style={styles.activeIndicator}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                                    </svg>
                                  </div>
                                )}
                                <div style={staticStyles.presetLabel}>{preset.label}</div>
                              </div>
                              {isActive && (
                                <div style={staticStyles.activeBadge}>
                                  <span style={styles.pulseAnimation}>●</span> Active
                                </div>
                              )}
                            </div>
                            <div style={styles.presetMeta}>
                              <span style={styles.statusBadge(preset.status)}>
                                {preset.status}
                              </span>
                              {isActive && (
                                <span style={styles.activeTime}>Now active</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={staticStyles.emptyState}>
          <svg style={staticStyles.emptyIcon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H8v-2h4v2zm0-4H8v-2h4v2zm0-4H8V7h4v2z" />
          </svg>
          <div style={staticStyles.emptyTitle}>No handlers found</div>
          <div style={staticStyles.emptyText}>
            {search ? 'Try adjusting your search criteria' : 'No MSW handlers are registered'}
          </div>
        </div>
      )}
    </div>
  );
});