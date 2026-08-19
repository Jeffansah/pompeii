import { describe, expect, it } from "vitest";

import { parseClientError } from "@pompeii/errors";
import { api } from "../../_generated/api";
import { makeConvexTest } from "../../test.setup";

describe("login/magicLinkCooldown", () => {
  it("rejects a missing email key", async () => {
    const t = makeConvexTest();
    const error = await t
      .query(api.login.magicLinkCooldown.handler.getRateLimit, { key: "" })
      .then(
        () => {
          throw new Error("Expected LOGIN_MAGIC_LINK_EMAIL_REQUIRED");
        },
        (caught: unknown) => caught,
      );
    expect(parseClientError(error)?.code).toBe(
      "LOGIN_MAGIC_LINK_EMAIL_REQUIRED",
    );
  });

  it("accepts a normalized email key", async () => {
    const t = makeConvexTest();
    const status = await t.query(
      api.login.magicLinkCooldown.handler.getRateLimit,
      { key: "  A@X.com " },
    );
    expect(status.value).toEqual(expect.any(Number));
    expect(status.config).toMatchObject({
      kind: "token bucket",
      rate: 1,
      period: 60_000,
      capacity: 1,
    });
  });
});
