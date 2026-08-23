import { afterEach, describe, expect, it, vi } from "vitest";

import {
  captureFirstCommentAnchor,
  restoreCommentAnchor,
  scrollCommentIntoView,
} from "./preserve-scroll-anchor";

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("comment scroll helpers", () => {
  it("restores the first visible reply after earlier replies prepend", () => {
    const container = document.createElement("div");
    const reply = document.createElement("article");
    reply.dataset.commentId = "reply:1";
    reply.getBoundingClientRect = () =>
      ({ top: 120 }) as DOMRect;
    container.append(reply);
    const anchor = captureFirstCommentAnchor(container);

    reply.getBoundingClientRect = () =>
      ({ top: 180 }) as DOMRect;
    const scrollBy = vi
      .spyOn(window, "scrollBy")
      .mockImplementation(() => undefined);
    restoreCommentAnchor(container, anchor);

    expect(scrollBy).toHaveBeenCalledWith({
      top: 60,
      behavior: "auto",
    });
  });

  it("scrolls only the requested comment into view", () => {
    const first = document.createElement("article");
    first.dataset.commentId = "first";
    first.scrollIntoView = vi.fn();
    const second = document.createElement("article");
    second.dataset.commentId = "second";
    second.scrollIntoView = vi.fn();
    document.body.append(first, second);
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({ matches: true } as MediaQueryList),
    );

    expect(scrollCommentIntoView("second")).toBe(true);
    expect(first.scrollIntoView).not.toHaveBeenCalled();
    expect(second.scrollIntoView).toHaveBeenCalledWith({
      block: "nearest",
      behavior: "auto",
    });
  });
});
