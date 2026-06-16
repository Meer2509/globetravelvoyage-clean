/** Run after the current render commit (avoids sync setState inside useEffect). */
export function defer(fn: () => void): void {
  queueMicrotask(fn);
}
