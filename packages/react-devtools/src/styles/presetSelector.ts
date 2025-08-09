import { CSSProperties } from 'react';
import { theme } from './theme';

export const presetSelectorStyles = {
  // Container
  container: {
    padding: theme.spacing[4],
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: theme.colors.background,
  } as CSSProperties,

  // Search and Filter Section
  searchSection: {
    marginBottom: theme.spacing[2],
  } as CSSProperties,

  searchRow: {
    display: 'flex',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[1],
  } as CSSProperties,

  searchInputWrapper: {
    position: 'relative',
    flex: 1,
  } as CSSProperties,

  searchInput: {
    width: '100%',
    paddingLeft: '28px',
    paddingRight: theme.spacing[2],
    paddingTop: '6px',
    paddingBottom: '6px',
    fontSize: '12px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background,
    color: theme.colors.foreground,
    outline: 'none',
    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
  } as CSSProperties,

  searchInputFocus: {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: theme.colors.primary,
    boxShadow: `0 0 0 3px ${theme.colors.primaryAlpha}`,
  } as CSSProperties,

  searchIcon: {
    position: 'absolute',
    left: theme.spacing[2],
    top: '50%',
    transform: 'translateY(-50%)',
    width: '12px',
    height: '12px',
    color: theme.colors.mutedForeground,
    pointerEvents: 'none',
  } as CSSProperties,

  filterSelect: {
    padding: `6px ${theme.spacing[2]}`,
    fontSize: '12px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background,
    color: theme.colors.foreground,
    outline: 'none',
    cursor: 'pointer',
    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
  } as CSSProperties,

  groupButton: (isActive: boolean) =>
    ({
      padding: '6px 8px',
      borderRadius: theme.radius.md,
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: isActive ? theme.colors.primary : theme.colors.border,
      backgroundColor: isActive
        ? theme.colors.primaryAlpha
        : theme.colors.background,
      color: isActive ? theme.colors.primary : theme.colors.mutedForeground,
      cursor: 'pointer',
      transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }) as CSSProperties,

  // Bulk Actions Bar
  bulkActionsBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing[1],
    paddingBottom: theme.spacing[1],
  } as CSSProperties,

  bulkActionsLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
  } as CSSProperties,

  bulkActionsRight: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[3],
  } as CSSProperties,

  linkButton: {
    fontSize: '14px',
    color: theme.colors.primary,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
  } as CSSProperties,

  linkButtonHover: {
    textDecoration: 'underline',
  } as CSSProperties,

  separator: {
    color: theme.colors.mutedForeground,
    fontSize: '14px',
  } as CSSProperties,

  statusText: {
    fontSize: '14px',
    color: theme.colors.mutedForeground,
  } as CSSProperties,

  clearButton: {
    padding: `6px ${theme.spacing[3]}`,
    fontSize: '12px',
    backgroundColor: 'transparent',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: theme.radius.md,
    cursor: 'pointer',
    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
    fontWeight: '500',
  } as CSSProperties,

  clearButtonHover: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  } as CSSProperties,

  // Presets List
  presetsList: {
    flex: 1,
    overflowY: 'auto',
    paddingRight: theme.spacing[1],
  } as CSSProperties,

  presetsGroup: {
    marginBottom: theme.spacing[4],
  } as CSSProperties,

  groupHeader: {
    position: 'sticky',
    top: 0,
    backgroundColor: 'rgba(249, 250, 251, 0.8)',
    backdropFilter: 'blur(8px)',
    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing[2],
    zIndex: 1,
  } as CSSProperties,

  groupTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: theme.colors.mutedForeground,
  } as CSSProperties,

  // Empty State
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.spacing[12],
    paddingBottom: theme.spacing[12],
    color: theme.colors.mutedForeground,
  } as CSSProperties,

  emptyIcon: {
    width: '48px',
    height: '48px',
    marginBottom: theme.spacing[4],
    opacity: 0.5,
  } as CSSProperties,

  emptyText: {
    fontSize: '14px',
    color: theme.colors.mutedForeground,
  } as CSSProperties,

  // Preset Card
  presetCard: (isActive: boolean, isSelected: boolean) =>
    ({
      position: 'relative' as const,
      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
      marginBottom: theme.spacing[2],
      borderRadius: theme.radius.lg,
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: isActive
        ? theme.colors.primary
        : isSelected
          ? '#a855f7'
          : theme.colors.border,
      backgroundColor: isActive 
        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(59, 130, 246, 0.03))'
        : theme.colors.card,
      background: isActive
        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(59, 130, 246, 0.03))'
        : theme.colors.card,
      transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
      cursor: 'pointer',
      boxShadow: isActive
          ? '0 2px 8px rgba(59, 130, 246, 0.2), inset 0 0 0 2px rgba(59, 130, 246, 0.15)'
          : isSelected
          ? '0 0 0 2px rgba(168, 85, 247, 0.2)'
          : 'none',
      transform: 'scale(1)',
    }) as CSSProperties,

  presetCardHover: {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: theme.colors.borderHover,
    boxShadow: theme.shadow.md,
  } as CSSProperties,

  presetCardContent: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing[3],
  } as CSSProperties,

  presetCheckbox: {
    width: '16px',
    height: '16px',
    marginTop: '4px',
    accentColor: '#a855f7',
    cursor: 'pointer',
  } as CSSProperties,

  presetInfo: {
    flex: 1,
    cursor: 'pointer',
  } as CSSProperties,

  presetBadges: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[2],
  } as CSSProperties,

  methodBadge: (method: string) => {
    const configs: Record<string, { bg: string; color: string; border: string }> = {
      GET: { 
        bg: 'rgba(16, 185, 129, 0.1)', 
        color: '#10b981',
        border: 'rgba(16, 185, 129, 0.3)'
      },
      POST: { 
        bg: 'rgba(59, 130, 246, 0.1)', 
        color: '#3b82f6',
        border: 'rgba(59, 130, 246, 0.3)'
      },
      PUT: { 
        bg: 'rgba(245, 158, 11, 0.1)', 
        color: '#f59e0b',
        border: 'rgba(245, 158, 11, 0.3)'
      },
      PATCH: { 
        bg: 'rgba(139, 92, 246, 0.1)', 
        color: '#8b5cf6',
        border: 'rgba(139, 92, 246, 0.3)'
      },
      DELETE: { 
        bg: 'rgba(239, 68, 68, 0.1)', 
        color: '#ef4444',
        border: 'rgba(239, 68, 68, 0.3)'
      },
    };
    const config = configs[method.toUpperCase()] || {
      bg: 'rgba(107, 114, 128, 0.1)',
      color: '#6b7280',
      border: 'rgba(107, 114, 128, 0.3)'
    };

    return {
      padding: '3px 10px',
      fontSize: '10px',
      fontWeight: '700',
      color: config.color,
      backgroundColor: config.bg,
      borderRadius: theme.radius.md,
      textTransform: 'uppercase' as const,
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: config.border,
      letterSpacing: '0.05em',
    } as CSSProperties;
  },

  statusBadge: (status: number) => {
    let backgroundColor = '';
    let color = '';
    let borderColor = '';
    
    if (status >= 200 && status < 300) {
      backgroundColor = 'rgba(16, 185, 129, 0.1)';
      color = '#10b981';
      borderColor = 'rgba(16, 185, 129, 0.2)';
    } else if (status >= 400 && status < 500) {
      backgroundColor = 'rgba(245, 158, 11, 0.1)';
      color = '#f59e0b';
      borderColor = 'rgba(245, 158, 11, 0.2)';
    } else if (status >= 500) {
      backgroundColor = 'rgba(239, 68, 68, 0.1)';
      color = '#ef4444';
      borderColor = 'rgba(239, 68, 68, 0.2)';
    } else {
      backgroundColor = 'rgba(107, 114, 128, 0.1)';
      color = '#6b7280';
      borderColor = 'rgba(107, 114, 128, 0.2)';
    }

    return {
      padding: '2px 8px',
      fontSize: '11px',
      fontWeight: '500',
      color: color,
      backgroundColor: backgroundColor,
      borderRadius: theme.radius.full,
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: borderColor,
    } as CSSProperties;
  },

  activeBadge: {
    padding: '4px 12px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: theme.radius.full,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
  } as CSSProperties,

  presetLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: theme.colors.foreground,
    marginBottom: '4px',
  } as CSSProperties,

  presetPath: {
    fontSize: '12px',
    fontFamily: 'monospace',
    color: theme.colors.mutedForeground,
  } as CSSProperties,

  // Toggle Switch
  toggleSwitch: (isActive: boolean) =>
    ({
      position: 'relative',
      width: '44px',
      height: '24px',
      backgroundColor: isActive ? theme.colors.primary : theme.colors.muted,
      borderRadius: theme.radius.full,
      cursor: 'pointer',
      transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
      border: 'none',
      padding: 0,
      marginTop: '4px',
    }) as CSSProperties,

  toggleThumb: (isActive: boolean) =>
    ({
      position: 'absolute',
      top: '4px',
      left: isActive ? '24px' : '4px',
      width: '16px',
      height: '16px',
      backgroundColor: 'white',
      borderRadius: theme.radius.full,
      transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.spring}`,
      boxShadow: theme.shadow.sm,
    }) as CSSProperties,

  // Loading state
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.spacing[12],
    paddingBottom: theme.spacing[12],
    color: theme.colors.mutedForeground,
  } as CSSProperties,

  spinner: {
    width: '48px',
    height: '48px',
    marginBottom: theme.spacing[4],
    animation: 'spin 1s linear infinite',
  } as CSSProperties,

  loadingText: {
    fontSize: '14px',
    color: theme.colors.mutedForeground,
  } as CSSProperties,
  
  // Additional styles for PresetSelectorRuntimeFixed
  emptyTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: theme.colors.foreground,
    marginTop: theme.spacing[3],
  } as CSSProperties,
  
  loadingSpinner: {
    width: '48px',
    height: '48px',
    animation: 'spin 1s linear infinite',
  } as CSSProperties,
  
  presetGroupHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
    backgroundColor: 'rgba(249, 250, 251, 0.95)',
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing[3],
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: theme.colors.border,
    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
  } as CSSProperties,

  activeGroupHeader: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderWidth: '1px',
  } as CSSProperties,

  activeGroupIndicator: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '11px',
    color: theme.colors.primary,
    fontWeight: '600',
    padding: '2px 8px',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: theme.radius.full,
    animation: 'pulse 2s infinite',
  } as CSSProperties,
  
  presetGroupContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: theme.spacing[2],
    paddingLeft: theme.spacing[2],
  } as CSSProperties,
  
  presetEndpoint: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: theme.colors.foreground,
  } as CSSProperties,
  
  presetStatus: {
    fontSize: '0.75rem',
    color: theme.colors.mutedForeground,
    marginTop: '4px',
  } as CSSProperties,

  activeIndicator: {
    width: '20px',
    height: '20px',
    borderRadius: theme.radius.full,
    backgroundColor: '#10b981',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
    animation: 'pulse 2s infinite',
  } as CSSProperties,

  pulseAnimation: {
    display: 'inline-block',
    animation: 'pulse 1.5s ease-in-out infinite',
    color: '#10b981',
    fontSize: '8px',
    marginRight: '2px',
  } as CSSProperties,

  presetMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '4px',
  } as CSSProperties,

  activeTime: {
    fontSize: '11px',
    color: '#10b981',
    fontWeight: '500',
  } as CSSProperties,
};
