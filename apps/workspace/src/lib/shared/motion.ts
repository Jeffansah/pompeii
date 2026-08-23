export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function motionDuration(name: string, fallback: number) {
  const value = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(name),
  );
  return Number.isFinite(value) ? value : fallback;
}
