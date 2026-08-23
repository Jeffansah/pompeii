import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SkeletonReveal } from "./skeleton-reveal";

describe("SkeletonReveal", () => {
  it("keeps the skeleton mounted until content is ready", () => {
    const markup = renderToStaticMarkup(
      <SkeletonReveal ready={false} skeleton={<span>Loading</span>}>
        <span>Ready</span>
      </SkeletonReveal>,
    );

    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain("t-skel-skeleton");
    expect(markup).toContain("Loading");
    expect(markup).toContain("Ready");
    expect(markup).not.toContain("is-revealed");
  });

  it("skips the skeleton when content is already ready", () => {
    const markup = renderToStaticMarkup(
      <SkeletonReveal ready skeleton={<span>Loading</span>}>
        <span>Ready</span>
      </SkeletonReveal>,
    );

    expect(markup).toContain('aria-busy="false"');
    expect(markup).toContain("is-revealed");
    expect(markup).not.toContain("t-skel-skeleton");
    expect(markup).toContain("Ready");
  });
});
