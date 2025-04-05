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
    // Flag to track if next page is loading
    let isLoadingNextPage = false;
    // Flag to check if we reached the last page
    let reachedLastPage = false;

    // Function to get search result elements
    function getSearchResults(): HTMLElement[] {
      // Get search results from Google's main container
      return Array.from(
        document.querySelectorAll(
          '#rso > div:has(> *) [data-hveid][data-ved] > [data-snc], #rso > :nth-child(1):has(> *) [data-hveid][data-ved]'
        )
      ).filter((el) => {
        // Only include elements that contain links
        const hasLink = el.querySelector('a');
        // Only include visible elements
        const isVisible = el.getBoundingClientRect().height > 0;
        return hasLink && isVisible;
      }) as HTMLElement[];
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
        // Load next page if we reached the last result
        if (!isLoadingNextPage && !reachedLastPage) {
          loadNextPage();
        }
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

    // Function to load the next page of results
    async function loadNextPage() {
      if (isLoadingNextPage || reachedLastPage) return;

      isLoadingNextPage = true;

      // Get the "Next" button
      const nextButton = document.querySelector('#pnnext') as HTMLAnchorElement;

      if (!nextButton) {
        reachedLastPage = true;
        isLoadingNextPage = false;
        return;
      }

      try {
        // Get URL for the next page
        const nextPageUrl = nextButton.href;

        // Fetch the next page content
        const response = await fetch(nextPageUrl);
        const html = await response.text();

        // Parse the HTML using DOMParser
        const parser = new DOMParser();
        const nextPageDoc = parser.parseFromString(html, 'text/html');

        // Get search results from the next page
        const nextPageResults = Array.from(
          nextPageDoc.querySelectorAll(
            '#search .g, #search [data-hveid]:not([data-hveid=""] > div)'
          )
        ).filter((el) => {
          const hasLink = el.querySelector('a');
          const isVisible = el.getBoundingClientRect().height > 0;
          return hasLink && isVisible;
        });

        // Get the current search results container
        const searchResultsContainer = document.querySelector('#search');

        if (searchResultsContainer && nextPageResults.length > 0) {
          // Remove the "Next" button (will be replaced later)
          nextButton.parentNode?.removeChild(nextButton);

          // Create loading indicator element
          const loadingIndicator = document.createElement('div');
          loadingIndicator.className = 'gsc-loading-indicator';
          loadingIndicator.textContent = 'Loading next page...';
          loadingIndicator.style.cssText =
            'text-align: center; padding: 20px; color: #666;';

          // Add loading indicator after search results
          searchResultsContainer.appendChild(loadingIndicator);

          // Add next page results to current page
          nextPageResults.forEach((result) => {
            const clone = document.importNode(result, true);
            searchResultsContainer.appendChild(clone);
          });

          // Remove loading indicator
          searchResultsContainer.removeChild(loadingIndicator);

          // Add the next page's "Next" button to current page
          const nextPageNextButton = nextPageDoc.querySelector('#pnnext');
          if (nextPageNextButton) {
            const nextButtonContainer = document.querySelector('#navcnt');
            if (nextButtonContainer) {
              const clone = document.importNode(nextPageNextButton, true);
              nextButtonContainer.querySelector('table')?.replaceWith(clone);
            }
          } else {
            // If there's no "Next" button, we've reached the last page
            reachedLastPage = true;
          }

          // Update the search results list
          searchResults = getSearchResults();
        } else {
          reachedLastPage = true;
        }
      } catch (error) {
        console.error('Error loading next page:', error);
      } finally {
        isLoadingNextPage = false;
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
        .gsc-loading-indicator {
          background-color: #f8f9fa;
          border-radius: 4px;
          margin: 10px 0;
          padding: 10px;
          text-align: center;
        }
      `;
      document.head.appendChild(styleEl);
    }

    // Scroll event handler
    function handleScroll() {
      // Load next page when near the bottom of the page
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (
        scrollPosition > documentHeight - 500 &&
        !isLoadingNextPage &&
        !reachedLastPage
      ) {
        loadNextPage();
      }
    }

    // Debounce function to limit event firing
    function debounce(func: Function, wait: number) {
      let timeout: number | null = null;

      return function (...args: any[]) {
        const later = () => {
          timeout = null;
          func(...args);
        };

        if (timeout !== null) {
          clearTimeout(timeout);
        }

        timeout = setTimeout(later, wait) as unknown as number;
      };
    }

    // Initialization function
    function init() {
      // Add styles
      addStyles();

      // Set up event listeners
      document.addEventListener('keydown', handleKeyDown);

      // Set up scroll event listener with debouncing
      window.addEventListener('scroll', debounce(handleScroll, 200));

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
      window.removeEventListener('scroll', handleScroll);
    };
  },
};
