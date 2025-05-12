// Shared constants for Google Search Navigator
export const FOCUS_STYLE = 'gsc-focused-result';
export const MARKED_STYLE = 'gsc-marked-result';
export const DEBUG = import.meta.env.MODE !== 'production';

export function log(...args: any[]): void {
  if (DEBUG) {
    console.log('[Google Search Navigator]', ...args);
  }
}

export const KEYS = {
  MOVE_DOWN: 'j',
  MOVE_UP: 'k',
  GO_TOP_PART: 'g',
  GO_BOTTOM: 'G',
  // DEPRECATED: use H
  PREV_PAGE_PART: '[',
  // DEPRECATED: use L
  NEXT_PAGE_PART: ']',
  PREV_PAGE: 'H',
  NEXT_PAGE: 'L',
  TOGGLE_MARK: ' ',
  VISUAL_MODE: 'v',
  COPY_URL: 'c',
  COPY_MARKDOWN: 'C',
  ESCAPE: 'Escape',
  MARK_ALL: 'A',
  CLEAR_MARKS: 'D',
  OPEN_TABS: 'o',
  ENTER: 'Enter',
  HISTORY_BACK: 'o', // Ctrl+o to go back in history
  HISTORY_FORWARD: 'i', // Ctrl+i to go forward in history
  HELP: '?',
} as const;

export const HELPS = {
  navigation: {
    j: `Move focus to the next search result`,
    k: `Move focus to the previous search result`,
    gg: `Jump to the first search result`,
    G: `Jump to the last search result`,
    H: `Navigate to the previous page`,
    L: `Navigate to the next page`,
    'Ctrl+o': `Navigate back in browser history`,
    'Ctrl+i': `Navigate forward in browser history`,
    '?': `Show help`,
    Escape: `Close help/exit visual mode`,
  },
  selection: {
    Space: `Toggle mark on the currently focused result`,
    v: `Enter visual mode`,
    A: `Mark all results`,
    D: `Clear marks`,
  },
  actions: {
    Enter: `Open focused result (Cmd|Ctrl+Enter for new tab)`,
    o: `Open in new tabs`,
    c: `Copy URLs`,
    C: `Copy Markdown`,
  },
} as const;

export const SEARCH_RESULTS_SELECTOR =
  '#rso > div:has(> *) [data-hveid][data-ved] > [data-snc], #rso > :nth-child(1):has(> :nth-child(2)) [data-hveid][data-ved] > div:not([data-snc]), #rso > div:nth-child(2) [data-hveid][data-ved] > div:not([data-snc])';

export const QUERY_CANDIDATES_SELECTOR =
  '#fprs > .Pqkn2e, #oFNiHe > :not(:has(#fprs)) > p';

export const ALL_SEARCH_RESULTS_SELECTOR = `${SEARCH_RESULTS_SELECTOR}, ${QUERY_CANDIDATES_SELECTOR}`;
