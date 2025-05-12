import { log, MARKED_STYLE } from './constants';
import { state } from './state';

export function toggleMark(index: number): void {
  if (index < 0 || index >= state.searchResults.length) return;
  const el = state.searchResults[index];
  if (state.markedResults.has(index)) {
    state.markedResults.delete(index);
    el.classList.remove(MARKED_STYLE);
  } else {
    state.markedResults.add(index);
    el.classList.add(MARKED_STYLE);
  }
  log(
    `Result ${index} ${
      state.markedResults.has(index) ? 'marked' : 'unmarked'
    }, total marked: ${state.markedResults.size}`
  );
}

export function toggleCurrentMark(): void {
  if (state.currentFocusIndex >= 0) toggleMark(state.currentFocusIndex);
}

export function markAll(): void {
  state.searchResults.forEach((el, i) => {
    state.markedResults.add(i);
    el.classList.add(MARKED_STYLE);
  });
  log(`Marked all results, total: ${state.markedResults.size}`);
}

export function clearAllMarks(): void {
  state.searchResults.forEach((el, i) => {
    el.classList.remove(MARKED_STYLE);
  });
  state.markedResults.clear();
  log('Cleared all marks');
}

export function startVisualMode(): void {
  state.visualModeActive = true;
  state.visualModeStartIndex = state.currentFocusIndex;
  log('Visual mode started at index', state.visualModeStartIndex);
  if (state.currentFocusIndex >= 0) {
    state.markedResults.add(state.currentFocusIndex);
    state.searchResults[state.currentFocusIndex].classList.add(MARKED_STYLE);
  }
}

export function exitVisualMode(): void {
  state.visualModeActive = false;
  state.visualModeStartIndex = -1;
  log('Visual mode exited, keeping marks');
}

export function updateVisualModeSelection(): void {
  clearAllMarks();
  const start = Math.min(state.visualModeStartIndex, state.currentFocusIndex);
  const end = Math.max(state.visualModeStartIndex, state.currentFocusIndex);
  for (let i = start; i <= end; i++) {
    state.markedResults.add(i);
    state.searchResults[i].classList.add(MARKED_STYLE);
  }
  log(
    `Visual mode selection: ${start} to ${end}, total marked: ${state.markedResults.size}`
  );
}
