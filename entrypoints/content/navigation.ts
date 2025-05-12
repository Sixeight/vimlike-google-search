import {
  ALL_SEARCH_RESULTS_SELECTOR,
  FOCUS_STYLE,
  log,
  SEARCH_RESULTS_SELECTOR,
} from './constants';
import { updateVisualModeSelection } from './selection';
import { state } from './state';

// Get all visible search result elements
export function getSearchResults(): HTMLElement[] {
  const results = Array.from(
    document.querySelectorAll(ALL_SEARCH_RESULTS_SELECTOR)
  ).filter((el) => {
    const hasLink = (el as HTMLElement).querySelector('a');
    const isVisible = (el as HTMLElement).getBoundingClientRect().height > 0;
    return hasLink && isVisible;
  }) as HTMLElement[];
  log('Found', results.length, 'search results');
  return results;
}

// Focus one result and scroll it into view
export function focusResult(index: number): void {
  if (
    state.currentFocusIndex >= 0 &&
    state.searchResults[state.currentFocusIndex]
  ) {
    state.searchResults[state.currentFocusIndex].classList.remove(FOCUS_STYLE);
  }
  state.currentFocusIndex = index;
  if (state.currentFocusIndex < 0) state.currentFocusIndex = 0;
  else if (state.currentFocusIndex >= state.searchResults.length)
    state.currentFocusIndex = state.searchResults.length - 1;

  const el = state.searchResults[state.currentFocusIndex];
  if (el) {
    el.classList.add(FOCUS_STYLE);
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (state.visualModeActive && state.visualModeStartIndex >= 0) {
      updateVisualModeSelection();
    }
  }
}

// Navigate to the next page of search results
export function navigateToNextPage(): void {
  const btn = document.querySelector('#pnnext') as HTMLAnchorElement;
  if (btn?.href) {
    log('Navigating to next page');
    window.location.href = btn.href;
  } else {
    log('No next page available');
  }
}

// Navigate to the previous page
export function navigateToPreviousPage(): void {
  const btn = document.querySelector('#pnprev') as HTMLAnchorElement;
  if (btn?.href) {
    log('Navigating to previous page');
    window.location.href = btn.href;
  } else {
    log('No previous page available');
  }
}

// Navigate browser history
export function navigateHistoryBack(): void {
  log('Navigating back in history');
  window.history.back();
}
export function navigateHistoryForward(): void {
  log('Navigating forward in history');
  window.history.forward();
}

// Open a link in a new tab (handles Ctrl/Cmd)
function isMacOS(): boolean {
  return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
}
export function openLinkInNewTab(link: HTMLAnchorElement): void {
  if (!link?.href) return;
  const ev = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window,
    ctrlKey: !isMacOS(),
    metaKey: isMacOS(),
  });
  link.dispatchEvent(ev);
}

// Initialize search results observer and initial focus
export function initNavigation(): void {
  state.searchResults = getSearchResults();
  let initialFocusIndex = 0;
  for (let i = 0; i < state.searchResults.length; i++) {
    if (
      state.searchResults[i].matches &&
      state.searchResults[i].matches(SEARCH_RESULTS_SELECTOR)
    ) {
      initialFocusIndex = i;
      break;
    }
  }
  if (state.searchResults.length > 0) focusResult(initialFocusIndex);
  const observer = new MutationObserver(() => {
    state.searchResults = getSearchResults();
    if (state.currentFocusIndex >= state.searchResults.length) {
      state.currentFocusIndex = state.searchResults.length - 1;
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
