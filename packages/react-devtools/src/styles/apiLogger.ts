import { CSSProperties } from 'react';
import { theme } from './theme';

export const apiLoggerStyles = {
  container: {
    padding: theme.spacing[4],
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: theme.colors.background,
  } as CSSProperties,

  header: {
    marginBottom: theme.spacing[4],
  } as CSSProperties,

  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  } as CSSProperties,

  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: theme.colors.foreground,
  } as CSSProperties,

  clearButton: {
    padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
    fontSize: '14px',
    backgroundColor: theme.colors.muted,
    color: theme.colors.foreground,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    cursor: 'pointer',
    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
  } as CSSProperties,

  clearButtonHover: {
    backgroundColor: theme.colors.mutedForeground,
    color: theme.colors.background,
  } as CSSProperties,

  filters: {
    display: 'flex',
    gap: theme.spacing[2],
  } as CSSProperties,

  filterSelect: {
    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
    fontSize: '14px',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background,
    color: theme.colors.foreground,
    cursor: 'pointer',
    outline: 'none',
    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
  } as CSSProperties,

  filterInput: {
    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
    fontSize: '14px',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background,
    color: theme.colors.foreground,
    outline: 'none',
    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
    minWidth: '200px',
  } as CSSProperties,

  filterInputFocus: {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: theme.colors.primary,
    boxShadow: `0 0 0 3px ${theme.colors.primaryAlpha}`,
  } as CSSProperties,

  logsList: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
  } as CSSProperties,

  logEntry: {
    padding: theme.spacing[3],
    marginBottom: theme.spacing[2],
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.card,
    fontFamily: 'monospace',
    fontSize: '12px',
    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
  } as CSSProperties,

  logEntryHover: {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: theme.colors.borderHover,
    boxShadow: theme.shadow.sm,
  } as CSSProperties,

  logHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[2],
  } as CSSProperties,

  logTimestamp: {
    fontSize: '11px',
    color: theme.colors.mutedForeground,
  } as CSSProperties,

  methodBadge: (method: string) => {
    const colors: Record<string, string> = {
      GET: '#10b981',
      POST: '#3b82f6',
      PUT: '#f59e0b',
      PATCH: '#8b5cf6',
      DELETE: '#ef4444',
    };
    const color = colors[method.toUpperCase()] || '#6b7280';

    return {
      padding: '2px 6px',
      fontSize: '11px',
      fontWeight: '600',
      color: 'white',
      backgroundColor: color,
      borderRadius: theme.radius.sm,
      textTransform: 'uppercase' as const,
    } as CSSProperties;
  },

  statusBadge: (status: number) => {
    let backgroundColor = '#6b7280';
    const color = 'white';

    if (status === 0) {
      backgroundColor = '#dc2626';
    } else if (status >= 200 && status < 300) {
      backgroundColor = '#10b981';
    } else if (status >= 300 && status < 400) {
      backgroundColor = '#3b82f6';
    } else if (status >= 400 && status < 500) {
      backgroundColor = '#f59e0b';
    } else if (status >= 500) {
      backgroundColor = '#ef4444';
    }

    return {
      padding: '2px 6px',
      fontSize: '11px',
      fontWeight: '600',
      color,
      backgroundColor,
      borderRadius: theme.radius.sm,
    } as CSSProperties;
  },

  durationBadge: {
    padding: '2px 6px',
    fontSize: '11px',
    color: theme.colors.mutedForeground,
    backgroundColor: theme.colors.muted,
    borderRadius: theme.radius.sm,
  } as CSSProperties,

  presetBadge: {
    padding: '2px 6px',
    fontSize: '11px',
    color: theme.colors.primary,
    backgroundColor: theme.colors.primaryAlpha,
    borderRadius: theme.radius.sm,
  } as CSSProperties,

  logPath: {
    fontSize: '13px',
    color: theme.colors.foreground,
    wordBreak: 'break-all' as const,
  } as CSSProperties,

  logDetails: {
    marginTop: theme.spacing[2],
    paddingTop: theme.spacing[2],
    borderTop: `1px solid ${theme.colors.border}`,
  } as CSSProperties,

  detailRow: {
    display: 'flex',
    marginBottom: theme.spacing[1],
  } as CSSProperties,

  detailLabel: {
    fontSize: '11px',
    color: theme.colors.mutedForeground,
    minWidth: '80px',
  } as CSSProperties,

  detailValue: {
    fontSize: '11px',
    color: theme.colors.foreground,
    wordBreak: 'break-all' as const,
  } as CSSProperties,

  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${theme.spacing[8]} ${theme.spacing[4]}`,
    color: theme.colors.mutedForeground,
  } as CSSProperties,

  emptyIcon: {
    width: '48px',
    height: '48px',
    marginBottom: theme.spacing[3],
    opacity: 0.5,
  } as CSSProperties,

  emptyTitle: {
    fontSize: '16px',
    fontWeight: '500',
    color: theme.colors.foreground,
    marginBottom: theme.spacing[2],
  } as CSSProperties,

  emptyText: {
    fontSize: '14px',
    color: theme.colors.mutedForeground,
    textAlign: 'center' as const,
  } as CSSProperties,

  stats: {
    display: 'flex',
    gap: theme.spacing[4],
    padding: theme.spacing[3],
    backgroundColor: theme.colors.muted,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing[3],
  } as CSSProperties,

  statItem: {
    display: 'flex',
    flexDirection: 'column' as const,
  } as CSSProperties,

  statLabel: {
    fontSize: '11px',
    color: theme.colors.mutedForeground,
    marginBottom: '4px',
  } as CSSProperties,

  statValue: {
    fontSize: '18px',
    fontWeight: '600',
    color: theme.colors.foreground,
  } as CSSProperties,
};
