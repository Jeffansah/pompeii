import { beforeEach, describe, expect, it, vi } from "vitest";

const verify = vi.hoisted(() => vi.fn());
const getSession = vi.hoisted(() => vi.fn());
const updateSession = vi.hoisted(() => vi.fn());

vi.mock("./client", () => ({
  authClient: {
    crossDomain: {
      oneTimeToken: { verify },
    },
    getSession,
    updateSession,
  },
}));

async function loadConsume() {
  return await import("./consume-one-time-token");
}

describe("urlHasOneTimeToken", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/new");
  });

  it("is false without ott", async () => {
    const { urlHasOneTimeToken } = await loadConsume();
    expect(urlHasOneTimeToken()).toBe(false);
  });

  it("is true when ott is in the query", async () => {
    window.history.replaceState({}, "", "/new?ott=abc");
    const { urlHasOneTimeToken } = await loadConsume();
    expect(urlHasOneTimeToken()).toBe(true);
  });
});

describe("consumeOneTimeToken", () => {
  beforeEach(() => {
    vi.resetModules();
    verify.mockReset();
    getSession.mockReset();
    updateSession.mockReset();
    window.history.replaceState({}, "", "/new");
  });

  it("is a no-op without ott", async () => {
    const { consumeOneTimeToken } = await loadConsume();
    await consumeOneTimeToken();
    expect(verify).not.toHaveBeenCalled();
  });

  it("strips ott and verifies once", async () => {
    window.history.replaceState({}, "", "/new?ott=abc");
    verify.mockResolvedValue({ data: { session: { token: "session-token" } } });
    getSession.mockResolvedValue({});
    const { consumeOneTimeToken } = await loadConsume();
    await consumeOneTimeToken();
    expect(window.location.search).not.toContain("ott");
    expect(verify).toHaveBeenCalledWith({ token: "abc" });
    expect(getSession).toHaveBeenCalledOnce();
    expect(updateSession).toHaveBeenCalledOnce();
  });

  it("reuses the in-flight exchange", async () => {
    window.history.replaceState({}, "", "/new?ott=abc");
    let resolveVerify: (value: unknown) => void = () => {};
    verify.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveVerify = resolve;
        }),
    );
    const { consumeOneTimeToken } = await loadConsume();
    const first = consumeOneTimeToken();
    const second = consumeOneTimeToken();
    expect(first).toBe(second);
    expect(verify).toHaveBeenCalledOnce();
    resolveVerify({ data: null });
    await first;
  });
});
