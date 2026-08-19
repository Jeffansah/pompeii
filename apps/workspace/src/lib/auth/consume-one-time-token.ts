import { authClient } from "./client";

let ottExchange: Promise<void> | undefined;

export function urlHasOneTimeToken() {
  if (typeof window === "undefined") {
    return false;
  }
  return new URLSearchParams(window.location.search).has("ott");
}

export function consumeOneTimeToken() {
  if (ottExchange) {
    return ottExchange;
  }

  const url = new URL(window.location.href);
  const token = url.searchParams.get("ott");
  if (!token) {
    ottExchange = Promise.resolve();
    return ottExchange;
  }

  url.searchParams.delete("ott");
  window.history.replaceState({}, "", url);

  ottExchange = (async () => {
    const result = await authClient.crossDomain.oneTimeToken.verify({
      token,
    });
    const session = result.data?.session;
    if (!session) {
      return;
    }
    await authClient.getSession({
      fetchOptions: {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      },
    });
    authClient.updateSession();
  })();

  return ottExchange;
}
