import { NavigatorState } from './types';

// Centralized navigator state
export const state: NavigatorState = {
  currentFocusIndex: 0,
  searchResults: [],
  markedResults: new Set<number>(),
  visualModeActive: false,
  visualModeStartIndex: -1,
};
