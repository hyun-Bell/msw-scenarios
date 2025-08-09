import { animations } from './animations';

const STYLE_ID = 'msw-devtools-styles';

/**
 * Injects MSW DevTools styles into the document head.
 * Returns a cleanup function to remove the styles.
 */
export function injectStyles(): () => void {
  // Skip in SSR environment
  if (typeof document === 'undefined') {
    return () => {};
  }

  // Check if styles are already injected
  if (document.getElementById(STYLE_ID)) {
    return () => {};
  }

  // Create and inject style element
  const styleElement = document.createElement('style');
  styleElement.id = STYLE_ID;
  styleElement.setAttribute('data-msw-devtools', 'true');
  styleElement.innerHTML = animations;

  // Insert at the end of head to ensure higher specificity
  document.head.appendChild(styleElement);

  // Return cleanup function
  return () => {
    const element = document.getElementById(STYLE_ID);
    if (element) {
      element.remove();
    }
  };
}

/**
 * Check if styles are already injected
 */
export function areStylesInjected(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }
  return !!document.getElementById(STYLE_ID);
}
