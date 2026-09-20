import { useEffect } from 'react';

interface ShortcutHandlers {
  onHelp?: () => void;
  onCapture?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts({ onHelp, onCapture, onEscape }: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl/Cmd + Shift + H -> Help
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.code === 'KeyH') {
        event.preventDefault();
        if (onHelp) onHelp();
      }

      // Check for Ctrl/Cmd + Shift + S -> Screen Capture
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.code === 'KeyS') {
        event.preventDefault();
        if (onCapture) onCapture();
      }

      // Check for Escape -> Close floating or active modals
      if (event.code === 'Escape') {
        if (onEscape) onEscape();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onHelp, onCapture, onEscape]);
}
