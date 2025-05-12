import { log } from './constants';
import { state } from './state';

function showCopyFeedback(elements: HTMLElement[]): void {
  elements.forEach((el) => {
    el.classList.add('gsc-copy-feedback');
    setTimeout(() => el.classList.remove('gsc-copy-feedback'), 500);
  });
}

function copyToClipboard(
  content: string,
  elements: HTMLElement[],
  message: string
): void {
  navigator.clipboard.writeText(content).then(() => {
    log(message);
    showCopyFeedback(elements);
  });
}

export function copyUrlsToClipboard(): void {
  if (state.markedResults.size === 0) {
    const idx = state.currentFocusIndex;
    const el = state.searchResults[idx];
    const link = el?.querySelector('a') as HTMLAnchorElement;
    if (link?.href) copyToClipboard(link.href, [el], 'URL copied to clipboard');
  } else {
    const indices = Array.from(state.markedResults).sort((a, b) => a - b);
    const urls = indices
      .map((i) => state.searchResults[i]?.querySelector('a')?.href)
      .filter(Boolean) as string[];
    const elements = indices
      .map((i) => state.searchResults[i])
      .filter(Boolean) as HTMLElement[];
    copyToClipboard(
      urls.join('\n'),
      elements,
      `${urls.length} URLs copied to clipboard`
    );
  }
}

export function copyUrlsAsMarkdown(): void {
  if (state.markedResults.size === 0) {
    const idx = state.currentFocusIndex;
    const el = state.searchResults[idx];
    const link = el?.querySelector('a') as HTMLAnchorElement;
    if (link?.href) {
      const title = link.textContent?.trim() || 'Link';
      copyToClipboard(`[${title}](${link.href})`, [el], 'Markdown link copied');
    }
  } else {
    const indices = Array.from(state.markedResults).sort((a, b) => a - b);
    const markdowns: string[] = [];
    const elements: HTMLElement[] = [];
    for (const i of indices) {
      const el = state.searchResults[i];
      const link = el?.querySelector('a') as HTMLAnchorElement;
      if (link?.href) {
        const title = link.textContent?.trim() || 'Link';
        markdowns.push(`- [${title}](${link.href})`);
        elements.push(el);
      }
    }
    copyToClipboard(
      markdowns.join('\n'),
      elements,
      `${markdowns.length} Markdown links copied`
    );
  }
}
