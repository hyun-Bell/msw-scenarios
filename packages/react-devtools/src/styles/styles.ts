import { CSSProperties } from 'react';
import { theme } from './theme';

export const styles = {
  // Floating toggle button
  floatingButton: {
    position: 'fixed' as const,
    width: '56px',
    height: '56px',
    borderRadius: theme.radius.full,
    border: 'none',
    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryHover})`,
    color: theme.colors.primaryForeground,
    boxShadow: theme.shadow.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: theme.zIndex.devtools,
    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.spring}`,
  } as CSSProperties,

  floatingButtonBottomRight: {
    bottom: theme.spacing[6],
    right: theme.spacing[6],
  } as CSSProperties,

  floatingButtonBottomLeft: {
    bottom: theme.spacing[6],
    left: theme.spacing[6],
  } as CSSProperties,

  floatingButtonTopRight: {
    top: theme.spacing[6],
    right: theme.spacing[6],
  } as CSSProperties,

  floatingButtonTopLeft: {
    top: theme.spacing[6],
    left: theme.spacing[6],
  } as CSSProperties,

  // Overlay
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(2px)',
    WebkitBackdropFilter: 'blur(2px)',
    zIndex: theme.zIndex.overlay,
  } as CSSProperties,

  // Sheet content
  sheetContent: {
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: '70vh',
    maxHeight: '700px',
    minHeight: '400px',
    backgroundColor: theme.colors.background,
    border: `1px solid ${theme.colors.border}`,
    borderBottom: 'none',
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    boxShadow: theme.shadow.xl,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    zIndex: theme.zIndex.modal,
  } as CSSProperties,

  // Drag handle
  dragHandle: {
    position: 'absolute' as const,
    top: theme.spacing[2],
    left: '50%',
    transform: 'translateX(-50%)',
    width: '48px',
    height: '4px',
    backgroundColor: theme.colors.mutedForeground,
    borderRadius: theme.radius.full,
    opacity: 0.4,
    cursor: 'grab',
  } as CSSProperties,

  // Sheet header
  sheetHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${theme.spacing[6]} ${theme.spacing[6]} ${theme.spacing[4]} ${theme.spacing[6]}`,
    borderBottom: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    minHeight: '72px',
    position: 'relative',
  } as CSSProperties,

  // Sheet title
  sheetTitle: {
    fontSize: theme.font.size.lg,
    fontWeight: theme.font.weight.semibold,
    color: theme.colors.foreground,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
  } as CSSProperties,

  // Close button
  closeButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    border: 'none',
    borderRadius: theme.radius.md,
    backgroundColor: 'transparent',
    color: theme.colors.mutedForeground,
    cursor: 'pointer',
    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.easeInOut}`,
  } as CSSProperties,

  // Tab navigation
  tabNavigation: {
    display: 'flex',
    backgroundColor: theme.colors.card,
    borderBottom: `1px solid ${theme.colors.border}`,
    position: 'relative',
  } as CSSProperties,

  // Tab button
  tabButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: theme.font.size.sm,
    fontWeight: theme.font.weight.medium,
    color: theme.colors.mutedForeground,
    cursor: 'pointer',
    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.easeInOut}`,
    position: 'relative',
    minHeight: '48px',
  } as CSSProperties,

  tabButtonActive: {
    color: theme.colors.primary,
    fontWeight: theme.font.weight.semibold,
  } as CSSProperties,

  // Content area
  contentArea: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: theme.colors.background,
    display: 'flex',
    flexDirection: 'column' as const,
  } as CSSProperties,

  // Screen reader only
  srOnly: {
    position: 'absolute' as const,
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap' as const,
    border: 0,
  } as CSSProperties,

  // Devtools container
  devtoolsContainer: {
    all: 'initial',
    display: 'block',
    position: 'relative',
    boxSizing: 'border-box',
    fontFamily: theme.font.family.sans,
    fontSize: theme.font.size.base,
    lineHeight: theme.font.lineHeight.normal,
    color: theme.colors.foreground,
    backgroundColor: 'transparent',
  } as CSSProperties,
};
