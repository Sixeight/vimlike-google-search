export type KeyAction = () => void;

export interface SequenceState {
  active: boolean;
  timer: number | null;
}

export interface NavigatorState {
  currentFocusIndex: number;
  searchResults: HTMLElement[];
  markedResults: Set<number>;
  visualModeActive: boolean;
  visualModeStartIndex: number;
}
