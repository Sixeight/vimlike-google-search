# Google Search Navigator

A browser extension that provides Vim-like keyboard shortcuts for Google search result pages. Navigate search results efficiently using just your keyboard.

## Features

- Efficient keyboard navigation through Google search results
- Multiple selection of search results to open in tabs
- Visual mode for range selection (like Vim)
- Page navigation with keyboard shortcuts
- Visual feedback for focused and selected results
- Copy URLs to clipboard in plain text or Markdown format

## Keyboard Shortcuts

### Navigation
- `j`: Move focus to the next search result
- `k`: Move focus to the previous search result
- `gg`: Jump to the first search result
- `G`: Jump to the last search result
- `[[`: Navigate to the previous page
- `]]`: Navigate to the next page
- `Ctrl+o`: Navigate back in browser history
- `Ctrl+i`: Navigate forward in browser history

### Selection
- `Space`: Toggle mark on the currently focused result
- `v`: Enter visual mode (move to select multiple results)
- `Escape`: Exit visual mode
- `A`: Select all results
- `D`: Deselect all results

### Actions
- `Enter`: Navigate to the currently focused search result
- `Command+Enter` (Mac) or `Ctrl+Enter` (Windows/Linux): Open the focused result in a new tab
- `o`: Open all marked results in new tabs
- `c`: Copy URLs of selected results to clipboard (or current focused result if none selected)
- `C`: Copy URLs in Markdown format to clipboard

## Usage

The extension is automatically enabled on Google search pages. Simply use the keyboard shortcuts listed above while on a search results page. The shortcuts work when the search input field is not focused.

## Development

This project is developed using [WXT](https://wxt.dev/).

### Starting the Development Server

```bash
npm run dev
```

### Building

```bash
npm run build
```

### Debugging in Firefox

```bash
npm run dev:firefox
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 
