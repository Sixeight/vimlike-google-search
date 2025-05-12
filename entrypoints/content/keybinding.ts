import { copyUrlsAsMarkdown, copyUrlsToClipboard } from './clipboard';
import { KEYS } from './constants';
import {
  focusResult,
  getSearchResults,
  navigateHistoryBack,
  navigateHistoryForward,
  navigateToNextPage,
  navigateToPreviousPage,
  openLinkInNewTab,
} from './navigation';
import {
  clearAllMarks,
  exitVisualMode,
  markAll,
  startVisualMode,
  toggleCurrentMark,
} from './selection';
import { state } from './state';
import { SequenceState } from './types';
import { hideHelp, toggleHelp } from './ui';

const keyActionMap = new Map<string, () => void>();

const keySequences: Record<string, SequenceState> = {
  [KEYS.GO_TOP_PART]: { active: false, timer: null },
  [KEYS.PREV_PAGE_PART]: { active: false, timer: null },
  [KEYS.NEXT_PAGE_PART]: { active: false, timer: null },
};

export function handleKeySequence(key: string, callback: () => void): boolean {
  const seq = keySequences[key];
  if (!seq) return false;
  // reset other sequences
  Object.keys(keySequences).forEach((k) => {
    if (k !== key) resetKeySequence(k);
  });
  if (seq.active) {
    callback();
    resetKeySequence(key);
    return true;
  } else {
    seq.active = true;
    if (seq.timer) clearTimeout(seq.timer);
    seq.timer = window.setTimeout(
      () => resetKeySequence(key),
      500
    ) as unknown as number;
    return false;
  }
}

export function resetKeySequence(key: string): void {
  const seq = keySequences[key];
  if (!seq) return;
  seq.active = false;
  if (seq.timer) {
    clearTimeout(seq.timer);
    seq.timer = null;
  }
}

export function resetAllKeySequences(): void {
  Object.keys(keySequences).forEach(resetKeySequence);
}

export function handleEnterKey(event: KeyboardEvent): void {
  const idx = state.currentFocusIndex;
  const el = state.searchResults[idx];
  const link = el?.querySelector('a') as HTMLAnchorElement;
  if (link?.href) {
    if (event.metaKey || event.ctrlKey) {
      openLinkInNewTab(link);
    } else {
      location.href = link.href;
    }
  }
}

export function handleOKey(): void {
  if (state.markedResults.size > 0) {
    state.searchResults.forEach((el, i) => {
      if (state.markedResults.has(i)) {
        const link = el.querySelector('a') as HTMLAnchorElement;
        if (link) openLinkInNewTab(link);
      }
    });
    clearAllMarks();
  } else {
    handleEnterKey({ ctrlKey: true } as KeyboardEvent);
  }
}

export function setupKeyBindings(): void {
  keyActionMap.set(KEYS.MOVE_DOWN, () =>
    focusResult(state.currentFocusIndex + 1)
  );
  keyActionMap.set(KEYS.MOVE_UP, () =>
    focusResult(state.currentFocusIndex - 1)
  );
  keyActionMap.set(KEYS.GO_BOTTOM, () =>
    focusResult(state.searchResults.length - 1)
  );
  keyActionMap.set(KEYS.TOGGLE_MARK, toggleCurrentMark);
  keyActionMap.set(KEYS.VISUAL_MODE, () =>
    state.visualModeActive ? exitVisualMode() : startVisualMode()
  );
  keyActionMap.set(KEYS.COPY_URL, copyUrlsToClipboard);
  keyActionMap.set(KEYS.COPY_MARKDOWN, copyUrlsAsMarkdown);
  keyActionMap.set(KEYS.ESCAPE, () => {
    if (state.visualModeActive) exitVisualMode();
    else hideHelp();
  });
  keyActionMap.set(KEYS.MARK_ALL, markAll);
  keyActionMap.set(KEYS.CLEAR_MARKS, clearAllMarks);
  keyActionMap.set(KEYS.OPEN_TABS, handleOKey);
  keyActionMap.set(KEYS.PREV_PAGE, navigateToPreviousPage);
  keyActionMap.set(KEYS.NEXT_PAGE, navigateToNextPage);
  keyActionMap.set(KEYS.HELP, toggleHelp);
}

export function handleKeyDown(event: KeyboardEvent): void {
  const active = document.activeElement as HTMLElement;
  if (
    active &&
    (active.tagName === 'INPUT' ||
      active.tagName === 'TEXTAREA' ||
      active.isContentEditable ||
      active.tagName === 'SELECT' ||
      active.hasAttribute('contenteditable'))
  ) {
    return;
  }

  // Update search results
  state.searchResults = getSearchResults();

  // Ctrl+o/i for history
  if (event.ctrlKey) {
    if (event.key === KEYS.HISTORY_BACK) {
      event.preventDefault();
      navigateHistoryBack();
      return;
    } else if (event.key === KEYS.HISTORY_FORWARD) {
      event.preventDefault();
      navigateHistoryForward();
      return;
    }
  }

  if ((event.ctrlKey || event.metaKey) && event.key !== KEYS.ENTER) {
    return;
  }

  // Sequential keys
  if (event.key === KEYS.GO_TOP_PART) {
    event.preventDefault();
    if (handleKeySequence(KEYS.GO_TOP_PART, () => focusResult(0))) return;
    return;
  } else if (event.key === KEYS.PREV_PAGE_PART) {
    event.preventDefault();
    if (handleKeySequence(KEYS.PREV_PAGE_PART, navigateToPreviousPage)) return;
    return;
  } else if (event.key === KEYS.NEXT_PAGE_PART) {
    event.preventDefault();
    if (handleKeySequence(KEYS.NEXT_PAGE_PART, navigateToNextPage)) return;
    return;
  }

  const action = keyActionMap.get(event.key);
  if (action) {
    event.preventDefault();
    resetAllKeySequences();
    action();
    return;
  }

  if (event.key === KEYS.ENTER) {
    event.preventDefault();
    resetAllKeySequences();
    handleEnterKey(event);
    return;
  }

  resetAllKeySequences();
}
