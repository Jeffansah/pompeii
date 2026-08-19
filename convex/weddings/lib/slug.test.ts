import { describe, expect, it } from "vitest";

import { slugify } from "./slug";

describe("slugify", () => {
  it("slugifies a couple name", () => {
    expect(slugify("Amara & Tomi")).toBe("amara-tomi");
  });

  it("strips diacritics", () => {
    expect(slugify("Amélie")).toBe("amelie");
  });

  it("returns wedding when nothing remains", () => {
    expect(slugify("!!!")).toBe("wedding");
  });

  it("blocks reserved first segments", () => {
    expect(slugify("New")).toBe("new-wedding");
    expect(slugify("auth")).toBe("auth-wedding");
    expect(slugify("weddings")).toBe("weddings-wedding");
  });
});
