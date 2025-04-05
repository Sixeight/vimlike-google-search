# Google Search Navigator

A browser extension that provides Vim-like keyboard shortcuts for Google search result pages. Navigate search results efficiently using just your keyboard.

## Features

- Efficient keyboard navigation through Google search results
- Visual focus indication for selected search results
- Infinite scrolling (automatically loads next page results)

## Keyboard Shortcuts

- `j`: Move focus to the next search result
- `k`: Move focus to the previous search result
- `Enter`: Navigate to the link of the currently focused search result
- `Command+Enter` (Mac) or `Ctrl+Enter` (Windows/Linux): Open the currently focused search result in a new tab

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
