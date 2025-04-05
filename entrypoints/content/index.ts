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
    // Debug mode - set to true to see console logs
    const DEBUG = true;

    // Helper function for logging in debug mode
    function log(...args: any[]) {
      if (DEBUG) {
        console.log('[Google Search Navigator]', ...args);
      }
    }

    // Modern Google search results selector
    const SEARCH_RESULTS_SELECTOR =
      '#rso > div:has(> *) [data-hveid][data-ved] > [data-snc], #rso > :nth-child(1):has(> *) [data-hveid][data-ved]';

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

        // Ensure the element is visible by scrolling to it
        currentElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
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
          focusResult(currentFocusIndex + 1);
          break;

        case 'k': // Move focus to previous result
          event.preventDefault();
          focusResult(currentFocusIndex - 1);
          break;

        case 'Enter': // Click on the current result
          if (currentFocusIndex >= 0 && searchResults[currentFocusIndex]) {
            event.preventDefault();

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
      `;
      document.head.appendChild(styleEl);
    }

    // Initialization function
    function init() {
      log('Initializing Google Search Navigator');

      // Add styles
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
