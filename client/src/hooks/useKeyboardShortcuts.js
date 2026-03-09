import { useEffect } from 'react';

export function useKeyboardShortcuts(shortcuts = []) {
  useEffect(() => {
    const handler = (event) => {
      shortcuts.forEach((shortcut) => {
        if (shortcut.key.toLowerCase() === event.key.toLowerCase()) {
          shortcut.action(event);
        }
      });
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}


