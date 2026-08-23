import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  OverviewPosterCard,
  type OverviewPosterCardData,
} from "./overview-poster-card";

const card: OverviewPosterCardData = {
  stableKey: "test-card",
  imageUrl: "https://example.com/image.jpg",
  imageAlt: "A wedding ceremony",
  imageCreator: "A Photographer",
  imageLicense: "Unsplash License",
  caption: "A beginning, carefully gathered",
  quote: "Love is patient.",
  author: "William Shakespeare",
  sourceTitle: "A Source",
  sourceUrl: "https://example.com/source",
};

describe("OverviewPosterCard", () => {
  it("renders the quote and attribution", () => {
    const markup = renderToStaticMarkup(<OverviewPosterCard card={card} />);

    expect(markup).toContain("Love is patient.");
    expect(markup).toContain("William Shakespeare");
    expect(markup).toContain('aria-hidden="true"');
  });

  it("renders the local card when the catalog is empty", () => {
    const markup = renderToStaticMarkup(<OverviewPosterCard card={null} />);

    expect(markup).toContain("poster-fallback-scenery");
    expect(markup).toContain(
      "Love is not love which alters when it alteration finds.",
    );
  });

  it("renders the local card when loading fails", () => {
    const markup = renderToStaticMarkup(
      <OverviewPosterCard card={undefined} error />,
    );

    expect(markup).toContain("poster-fallback-scenery");
    expect(markup).toContain(
      "Love is not love which alters when it alteration finds.",
    );
  });
});
