// Content script definition
export default {
  matches: ['*://www.google.com/search?*'],
  main() {
    // Index of the currently focused search result
    let currentFocusIndex = -1;
    // List of search result elements
    let searchResults: HTMLElement[] = [];
    // Style class for focused elements
    const FOCUS_STYLE = 'gsc-focused-result';
    // Style class for marked elements
    const MARKED_STYLE = 'gsc-marked-result';
    // Set to store marked result indices
    const markedResults = new Set<number>();
    // Track if in visual mode
    let visualModeActive = false;
    // Start index for visual mode
    let visualModeStartIndex = -1;
    // Debug mode - automatically disabled in production builds
    const DEBUG = import.meta.env.MODE !== 'production';

    // Helper function for logging in debug mode
    function log(...args: any[]) {
      if (DEBUG) {
        console.log('[Google Search Navigator]', ...args);
      }
    }

    // Modern Google search results selector
    const SEARCH_RESULTS_SELECTOR =
      '#rso > div:has(> *) [data-hveid][data-ved] > [data-snc], #rso > :nth-child(1):has(> *) [data-hveid][data-ved] > :not([data-snc])';

    // Function to get search result elements
    function getSearchResults(): HTMLElement[] {
      // Get search results from Google's main container
      const results = Array.from(
        document.querySelectorAll(SEARCH_RESULTS_SELECTOR)
      ).filter((el) => {
        // Only include elements that contain links
        const hasLink = el.querySelector('a');
        // Only include visible elements
        const isVisible = el.getBoundingClientRect().height > 0;
        return hasLink && isVisible;
      }) as HTMLElement[];

      log('Found', results.length, 'search results');
      return results;
    }

    // Function to focus on a search result
    function focusResult(index: number) {
      // Clear previous focus
      if (currentFocusIndex >= 0 && searchResults[currentFocusIndex]) {
        searchResults[currentFocusIndex].classList.remove(FOCUS_STYLE);
      }

      // Set new index
      currentFocusIndex = index;

      // Adjust index if out of bounds
      if (currentFocusIndex < 0) {
        currentFocusIndex = 0;
      } else if (currentFocusIndex >= searchResults.length) {
        currentFocusIndex = searchResults.length - 1;
      }

      // Focus on the new element
      if (currentFocusIndex >= 0 && searchResults[currentFocusIndex]) {
        const currentElement = searchResults[currentFocusIndex];
        currentElement.classList.add(FOCUS_STYLE);

        // If in visual mode, mark all results between start and current
        if (visualModeActive && visualModeStartIndex >= 0) {
          updateVisualModeSelection();
        }

        // Ensure the element is visible by scrolling to it
        currentElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }

    // Function to toggle mark status of a result
    function toggleMark(index: number) {
      if (index < 0 || index >= searchResults.length) return;

      const element = searchResults[index];

      if (markedResults.has(index)) {
        markedResults.delete(index);
        element.classList.remove(MARKED_STYLE);
      } else {
        markedResults.add(index);
        element.classList.add(MARKED_STYLE);
      }

      log(
        `Result ${index} ${
          markedResults.has(index) ? 'marked' : 'unmarked'
        }, total marked: ${markedResults.size}`
      );
    }

    // Function to toggle mark status of current result
    function toggleCurrentMark() {
      if (currentFocusIndex >= 0) {
        toggleMark(currentFocusIndex);
      }
    }

    // Function to update visual mode selection
    function updateVisualModeSelection() {
      // Clear all marks first to avoid conflicts
      clearAllMarks();

      // Determine start and end indices
      const startIdx = Math.min(visualModeStartIndex, currentFocusIndex);
      const endIdx = Math.max(visualModeStartIndex, currentFocusIndex);

      // Mark all elements in range
      for (let i = startIdx; i <= endIdx; i++) {
        markedResults.add(i);
        searchResults[i].classList.add(MARKED_STYLE);
      }

      log(
        `Visual mode selection: ${startIdx} to ${endIdx}, total marked: ${markedResults.size}`
      );
    }

    // Function to start visual mode
    function startVisualMode() {
      visualModeActive = true;
      visualModeStartIndex = currentFocusIndex;
      log('Visual mode started at index', visualModeStartIndex);

      // Mark the current element to begin with
      if (currentFocusIndex >= 0) {
        markedResults.add(currentFocusIndex);
        searchResults[currentFocusIndex].classList.add(MARKED_STYLE);
      }
    }

    // Function to exit visual mode
    function exitVisualMode() {
      if (!visualModeActive) return;

      visualModeActive = false;
      visualModeStartIndex = -1;
      log('Visual mode exited, keeping marks');
    }

    // Function to mark all results
    function markAll() {
      for (let i = 0; i < searchResults.length; i++) {
        markedResults.add(i);
        searchResults[i].classList.add(MARKED_STYLE);
      }
      log(`Marked all results, total: ${markedResults.size}`);
    }

    // Function to clear all marks
    function clearAllMarks() {
      searchResults.forEach((element, index) => {
        if (markedResults.has(index)) {
          element.classList.remove(MARKED_STYLE);
        }
      });
      markedResults.clear();
      log('Cleared all marks');
    }

    // Function to open all marked results in new tabs
    function openMarkedInTabs() {
      if (markedResults.size === 0) {
        log('No marked results to open');
        return;
      }

      log(`Opening ${markedResults.size} results in new tabs`);

      // Convert to array and sort to open tabs in order
      const markedIndices = Array.from(markedResults).sort((a, b) => a - b);

      markedIndices.forEach((index) => {
        if (index >= 0 && index < searchResults.length) {
          const link = searchResults[index].querySelector(
            'a'
          ) as HTMLAnchorElement;
          if (link && link.href) {
            window.open(link.href, '_blank');
          }
        }
      });

      // Clear marks after opening
      clearAllMarks();
    }

    // State management for sequential key inputs
    type SequenceState = {
      active: boolean;
      timer: number | null;
    };

    // Store key sequence states
    const keySequences: Record<string, SequenceState> = {
      g: { active: false, timer: null },
      '[': { active: false, timer: null },
      ']': { active: false, timer: null },
    };

    // Function to handle sequential key inputs
    function handleKeySequence(key: string, callback: () => void): boolean {
      const state = keySequences[key];

      if (!state) return false;

      // Reset other sequences
      Object.keys(keySequences).forEach((k) => {
        if (k !== key) resetKeySequence(k);
      });

      if (state.active) {
        // Second key press
        callback();
        resetKeySequence(key);
        return true;
      } else {
        // First key press
        state.active = true;
        if (state.timer) {
          clearTimeout(state.timer);
        }
        state.timer = window.setTimeout(() => {
          resetKeySequence(key);
        }, 500) as unknown as number;
        return false;
      }
    }

    // Function to reset key sequence state
    function resetKeySequence(key: string) {
      const state = keySequences[key];
      if (!state) return;

      state.active = false;
      if (state.timer) {
        clearTimeout(state.timer);
        state.timer = null;
      }
    }

    // Reset all key sequences
    function resetAllKeySequences() {
      Object.keys(keySequences).forEach((key) => resetKeySequence(key));
    }

    // Keyboard event handler
    function handleKeyDown(event: KeyboardEvent) {
      // Do nothing if focus is on an input field
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          // @ts-ignore: isContentEditable is available in modern browsers
          activeElement.isContentEditable)
      ) {
        return;
      }

      // Update search results list
      searchResults = getSearchResults();

      switch (event.key) {
        case 'j': // Move focus to next result
          event.preventDefault();
          resetAllKeySequences();
          focusResult(currentFocusIndex + 1);
          break;

        case 'k': // Move focus to previous result
          event.preventDefault();
          resetAllKeySequences();
          focusResult(currentFocusIndex - 1);
          break;

        case 'g': // First part of 'gg' or second 'g' for top
          event.preventDefault();
          if (handleKeySequence('g', () => focusResult(0))) {
            // Second 'g' - already processed
          }
          break;

        case 'G': // Go to last result
          event.preventDefault();
          resetAllKeySequences();
          focusResult(searchResults.length - 1);
          break;

        case '[': // First part of '[[' for previous page
          event.preventDefault();
          if (handleKeySequence('[', navigateToPreviousPage)) {
            // Second '[' - already processed
          }
          break;

        case ']': // First part of ']]' for next page
          event.preventDefault();
          if (handleKeySequence(']', navigateToNextPage)) {
            // Second ']' - already processed
          }
          break;

        case ' ': // Space to toggle mark on current result
          event.preventDefault();
          resetAllKeySequences();
          toggleCurrentMark();
          break;

        case 'v': // Visual mode
          event.preventDefault();
          resetAllKeySequences();
          if (visualModeActive) {
            exitVisualMode();
          } else {
            startVisualMode();
          }
          break;

        case 'Escape': // Exit visual mode
          event.preventDefault();
          resetAllKeySequences();
          exitVisualMode();
          break;

        case 'A': // Mark all results
          event.preventDefault();
          resetAllKeySequences();
          markAll();
          break;

        case 'D': // Clear all marks
          event.preventDefault();
          resetAllKeySequences();
          clearAllMarks();
          break;

        case 'o': // Open all marked results in tabs
          event.preventDefault();
          resetAllKeySequences();
          openMarkedInTabs();
          break;

        case 'Enter': // Click on the current result
          event.preventDefault();
          resetAllKeySequences();

          if (currentFocusIndex >= 0 && searchResults[currentFocusIndex]) {
            const currentElement = searchResults[currentFocusIndex];
            const link = currentElement.querySelector('a') as HTMLAnchorElement;

            if (link) {
              // Open in new tab if Command/Ctrl key is pressed
              if (event.metaKey || event.ctrlKey) {
                window.open(link.href, '_blank');
              } else {
                location.href = link.href;
              }
            }
          }
          break;

        default:
          // Reset all states for any other key
          resetAllKeySequences();
          break;
      }
    }

    // Function to navigate to the next page
    function navigateToNextPage() {
      const nextPageButton = document.querySelector(
        '#pnnext'
      ) as HTMLAnchorElement;
      if (nextPageButton && nextPageButton.href) {
        log('Navigating to next page');
        window.location.href = nextPageButton.href;
      } else {
        log('No next page available');
      }
    }

    // Function to navigate to the previous page
    function navigateToPreviousPage() {
      const prevPageButton = document.querySelector(
        '#pnprev'
      ) as HTMLAnchorElement;
      if (prevPageButton && prevPageButton.href) {
        log('Navigating to previous page');
        window.location.href = prevPageButton.href;
      } else {
        log('No previous page available');
      }
    }

    // Add stylesheet to the page
    function addStyles() {
      const styleEl = document.createElement('style');
      styleEl.textContent = `
        .${FOCUS_STYLE} {
          background-color: rgba(66, 133, 244, 0.1);
          border-left: 3px solid #4285f4;
          padding-left: 8px;
          margin-left: -11px;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }
        .${MARKED_STYLE} {
          background-color: rgba(255, 193, 7, 0.15);
          border-left: 3px solid #ffc107;
          padding-left: 8px;
          margin-left: -11px;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }
        .${FOCUS_STYLE}.${MARKED_STYLE} {
          background-color: rgba(76, 175, 80, 0.15);
          border-left: 3px solid #4caf50;
        }
      `;
      document.head.appendChild(styleEl);
    }

    // Initialize the extension functionality
    function init() {
      log('Initializing Google Search Navigator');

      // Add custom styles
      addStyles();

      // Set up event listeners
      document.addEventListener('keydown', handleKeyDown);

      // Since Google search results might load dynamically,
      // observe DOM changes to update the search results list
      const observer = new MutationObserver(() => {
        searchResults = getSearchResults();

        // Fix focus index if it became invalid
        if (currentFocusIndex >= searchResults.length) {
          currentFocusIndex = searchResults.length - 1;
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Get initial search results
      searchResults = getSearchResults();
      log('Initial search results count:', searchResults.length);

      // Focus on first result when page loads
      if (searchResults.length > 0) {
        focusResult(0);
      }
    }

    // Run initialization when DOM is loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }

    // Return cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  },
};
