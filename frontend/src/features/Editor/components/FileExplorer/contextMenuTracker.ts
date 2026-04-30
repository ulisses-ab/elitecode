let openCount = 0;

export const contextMenuTracker = {
  increment() { openCount++; },
  decrement() { openCount = Math.max(0, openCount - 1); },
  isAnyOpen() { return openCount > 0; },
};
