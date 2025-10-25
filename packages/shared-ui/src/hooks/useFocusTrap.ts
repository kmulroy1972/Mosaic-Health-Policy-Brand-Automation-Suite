import { RefObject, useEffect } from 'react';

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([type="hidden"]):not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

export function useFocusTrap(containerRef: RefObject<HTMLElement | null>, active: boolean): void {
  useEffect(() => {
    if (!active) {
      return;
    }

    const previousFocused = (typeof document !== 'undefined' &&
      document.activeElement) as HTMLElement | null;

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const trapContainer = container;

    const focusable = Array.from(trapContainer.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS));
    focusable[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab') {
        return;
      }

      const elements = Array.from(
        trapContainer.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      ).filter((el) => !el.hasAttribute('disabled'));
      if (elements.length === 0) {
        event.preventDefault();
        trapContainer.focus();
        return;
      }

      const currentIndex = elements.indexOf(document.activeElement as HTMLElement);
      let nextIndex = currentIndex;

      if (event.shiftKey) {
        nextIndex = currentIndex <= 0 ? elements.length - 1 : currentIndex - 1;
      } else {
        nextIndex = currentIndex === elements.length - 1 ? 0 : currentIndex + 1;
      }

      elements[nextIndex]?.focus();
      event.preventDefault();
    }

    trapContainer.addEventListener('keydown', handleKeyDown);

    return () => {
      trapContainer.removeEventListener('keydown', handleKeyDown);
      if (previousFocused && typeof previousFocused.focus === 'function') {
        previousFocused.focus();
      }
    };
  }, [active, containerRef]);
}
