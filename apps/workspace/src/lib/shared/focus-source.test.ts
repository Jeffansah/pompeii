import { afterEach, describe, expect, it } from "vitest";

import { trackFocusSource } from "./focus-source";

afterEach(() => {
  document.documentElement.removeAttribute("data-focus-source");
});

describe("trackFocusSource", () => {
  it("starts as pointer and only becomes keyboard on Tab", () => {
    trackFocusSource();
    expect(document.documentElement.getAttribute("data-focus-source")).toBe(
      "pointer",
    );

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    expect(document.documentElement.getAttribute("data-focus-source")).toBe(
      "pointer",
    );

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
    expect(document.documentElement.getAttribute("data-focus-source")).toBe(
      "keyboard",
    );

    window.dispatchEvent(new Event("pointerdown"));
    expect(document.documentElement.getAttribute("data-focus-source")).toBe(
      "pointer",
    );
  });
});
