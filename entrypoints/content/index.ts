import { handleKeyDown, setupKeyBindings } from './keybinding';
import { initNavigation } from './navigation';
import { addStyles } from './ui';

export default {
  matches: ['*://www.google.com/search?*'],
  main() {
    addStyles();
    initNavigation();
    setupKeyBindings();
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  },
};
