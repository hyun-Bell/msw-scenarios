import { CSSProperties } from 'react';
import { theme } from './theme';

export const profileManagerStyles = {
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

  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: theme.colors.foreground,
    marginBottom: theme.spacing[2],
  } as CSSProperties,

  subtitle: {
    fontSize: '14px',
    color: theme.colors.mutedForeground,
  } as CSSProperties,

  profilesList: {
    flex: 1,
    overflowY: 'auto',
    marginBottom: theme.spacing[4],
  } as CSSProperties,

  profileCard: (isActive: boolean) =>
    ({
      padding: theme.spacing[4],
      marginBottom: theme.spacing[3],
      borderRadius: theme.radius.lg,
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: isActive ? theme.colors.primary : theme.colors.border,
      backgroundColor: isActive
        ? 'rgba(59, 130, 246, 0.05)'
        : theme.colors.card,
      cursor: isActive ? 'default' : 'pointer',
      transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
      boxShadow: isActive ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
    }) as CSSProperties,

  profileCardHover: {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: theme.colors.borderHover,
    boxShadow: theme.shadow.md,
  } as CSSProperties,

  profileHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing[3],
  } as CSSProperties,

  profileInfo: {
    flex: 1,
  } as CSSProperties,

  profileName: {
    fontSize: '16px',
    fontWeight: '500',
    color: theme.colors.foreground,
    marginBottom: theme.spacing[1],
  } as CSSProperties,

  profileStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
  } as CSSProperties,

  statusDot: (isActive: boolean) =>
    ({
      width: '8px',
      height: '8px',
      borderRadius: theme.radius.full,
      backgroundColor: isActive ? '#10b981' : theme.colors.mutedForeground,
      boxShadow: isActive ? '0 0 8px rgba(16, 185, 129, 0.5)' : 'none',
    }) as CSSProperties,

  statusText: {
    fontSize: '12px',
    color: theme.colors.mutedForeground,
  } as CSSProperties,

  profileActions: {
    display: 'flex',
    gap: theme.spacing[2],
  } as CSSProperties,

  actionButton: {
    padding: '6px',
    backgroundColor: 'transparent',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    cursor: 'pointer',
    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as CSSProperties,

  actionButtonHover: {
    backgroundColor: theme.colors.muted,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: theme.colors.borderHover,
  } as CSSProperties,

  actionIcon: {
    width: '16px',
    height: '16px',
    color: theme.colors.mutedForeground,
  } as CSSProperties,

  profilePresets: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: theme.spacing[2],
  } as CSSProperties,

  presetChip: {
    padding: '4px 10px',
    fontSize: '11px',
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    color: theme.colors.mutedForeground,
    borderRadius: theme.radius.full,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'rgba(107, 114, 128, 0.2)',
    fontFamily: 'monospace',
  } as CSSProperties,

  applyButton: {
    width: '100%',
    padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
    fontSize: '14px',
    fontWeight: '500',
    color: 'white',
    backgroundColor: theme.colors.primary,
    border: 'none',
    borderRadius: theme.radius.md,
    cursor: 'pointer',
    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
  } as CSSProperties,

  applyButtonHover: {
    backgroundColor: theme.colors.primaryHover,
  } as CSSProperties,

  applyButtonDisabled: {
    backgroundColor: theme.colors.muted,
    color: theme.colors.mutedForeground,
    cursor: 'not-allowed',
  } as CSSProperties,

  createSection: {
    padding: theme.spacing[4],
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: theme.colors.border,
  } as CSSProperties,

  createTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: theme.colors.foreground,
    marginBottom: theme.spacing[3],
  } as CSSProperties,

  createForm: {
    display: 'flex',
    gap: theme.spacing[2],
  } as CSSProperties,

  createInput: {
    flex: 1,
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
    fontSize: '14px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background,
    color: theme.colors.foreground,
    outline: 'none',
    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
  } as CSSProperties,

  createInputFocus: {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: theme.colors.primary,
    boxShadow: `0 0 0 3px ${theme.colors.primaryAlpha}`,
  } as CSSProperties,

  createButton: {
    padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
    fontSize: '14px',
    fontWeight: '500',
    color: 'white',
    backgroundColor: theme.colors.primary,
    border: 'none',
    borderRadius: theme.radius.md,
    cursor: 'pointer',
    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
    whiteSpace: 'nowrap' as const,
  } as CSSProperties,

  createButtonHover: {
    backgroundColor: theme.colors.primaryHover,
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
    maxWidth: '300px',
  } as CSSProperties,
};
