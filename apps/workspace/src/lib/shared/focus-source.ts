const FOCUS_SOURCE_ATTR = "data-focus-source";

function setFocusSource(source: "keyboard" | "pointer") {
  document.documentElement.setAttribute(FOCUS_SOURCE_ATTR, source);
}

function onPointerDown() {
  setFocusSource("pointer");
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === "Tab") {
    setFocusSource("keyboard");
  }
}

export function trackFocusSource() {
  setFocusSource("pointer");
  window.addEventListener("pointerdown", onPointerDown, true);
  window.addEventListener("keydown", onKeyDown, true);
}
