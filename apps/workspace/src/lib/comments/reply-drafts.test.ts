import { describe, expect, it } from "vitest";
import type { Id } from "@pompeii/api";

import { updateReplyDraft } from "./reply-drafts";

describe("reply drafts", () => {
  it("retains a separate draft for each root", () => {
    const first = "first" as Id<"comments">;
    const second = "second" as Id<"comments">;
    const withFirst = updateReplyDraft({}, first, "Draft one");
    const withSecond = updateReplyDraft(
      withFirst,
      second,
      "Draft two",
    );

    expect(withSecond).toEqual({
      first: "Draft one",
      second: "Draft two",
    });
    expect(withFirst).toEqual({ first: "Draft one" });
  });
});
