import { useEffect } from 'react';

export const REGION_ORDER = ['sidebar', 'editor', 'panels'] as const;

function isEditableElement(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return true;
  if ((el as HTMLElement).isContentEditable) return true;
  return false;
}

function getRegionForElement(el: Element | null): string | null {
  if (!el) return null;
  const regionEl = el.closest('[data-region]');
  if (!regionEl) return null;
  return regionEl.getAttribute('data-region');
}

function focusRegion(regionName: string) {
  const regionEl = document.querySelector(`[data-region="${regionName}"]`);
  if (!regionEl) return;

  // Try to focus the first focusable element within the region
  const focusable = regionEl.querySelector<HTMLElement>(
    'a[href], button:not([disabled]):not([tabindex="-1"]), [tabindex="0"], input:not([disabled]), textarea:not([disabled]), [contenteditable="true"]'
  );
  if (focusable) {
    focusable.focus();
  } else if (regionEl instanceof HTMLElement && regionEl.tabIndex >= 0) {
    regionEl.focus();
  }
}

export function useKeyboardNav() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      // Allow normal Tab inside editable elements (inputs, textareas, contenteditable)
      const activeEl = document.activeElement;
      if (isEditableElement(activeEl)) return;

      // Check if we're inside a recognized region
      const currentRegion = getRegionForElement(activeEl);
      if (!currentRegion) return;

      e.preventDefault();

      const currentIndex = REGION_ORDER.indexOf(currentRegion as typeof REGION_ORDER[number]);
      if (currentIndex === -1) return;

      let nextIndex: number;
      if (e.shiftKey) {
        nextIndex = (currentIndex - 1 + REGION_ORDER.length) % REGION_ORDER.length;
      } else {
        nextIndex = (currentIndex + 1) % REGION_ORDER.length;
      }

      focusRegion(REGION_ORDER[nextIndex]);
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);
}
