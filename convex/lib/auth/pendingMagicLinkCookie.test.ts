import { afterEach, describe, expect, it, vi } from "vitest";

import {
  clearPendingMagicLinkCookie,
  PENDING_MAGIC_LINK_COOKIE,
  PENDING_MAGIC_LINK_MAX_AGE_SECONDS,
  readPendingMagicLinkEmail,
  setPendingMagicLinkCookie,
  type PendingCookieCtx,
} from "./pendingMagicLinkCookie";

function createCookieCtx(): PendingCookieCtx & { store: Map<string, string> } {
  const store = new Map<string, string>();
  return {
    store,
    setCookie: (name, value) => {
      store.set(name, value);
    },
    getCookie: (name) => store.get(name),
  };
}

describe("pendingMagicLinkCookie", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("round-trips the email", async () => {
    const ctx = createCookieCtx();
    await setPendingMagicLinkCookie(ctx, "a@x.com");
    expect(await readPendingMagicLinkEmail(ctx)).toBe("a@x.com");
    expect(ctx.store.get(PENDING_MAGIC_LINK_COOKIE)).toBeTruthy();
  });

  it("rejects a tampered value", async () => {
    const ctx = createCookieCtx();
    await setPendingMagicLinkCookie(ctx, "a@x.com");
    const value = ctx.store.get(PENDING_MAGIC_LINK_COOKIE)!;
    ctx.setCookie(PENDING_MAGIC_LINK_COOKIE, `${value}x`, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: PENDING_MAGIC_LINK_MAX_AGE_SECONDS,
      path: "/",
    });
    expect(await readPendingMagicLinkEmail(ctx)).toBeNull();
  });

  it("rejects an expired cookie", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    const ctx = createCookieCtx();
    await setPendingMagicLinkCookie(ctx, "a@x.com");
    vi.setSystemTime(new Date("2026-01-01T00:06:00.000Z"));
    expect(await readPendingMagicLinkEmail(ctx)).toBeNull();
  });

  it("clears the cookie", async () => {
    const ctx = createCookieCtx();
    await setPendingMagicLinkCookie(ctx, "a@x.com");
    clearPendingMagicLinkCookie(ctx);
    expect(await readPendingMagicLinkEmail(ctx)).toBeNull();
  });

  it("returns null when no cookie is set", async () => {
    expect(await readPendingMagicLinkEmail(createCookieCtx())).toBeNull();
  });
});
