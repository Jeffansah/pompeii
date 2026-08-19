import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint, createAuthMiddleware } from "better-auth/api";

import {
  clearPendingMagicLinkCookie,
  readPendingMagicLinkEmail,
} from "./pendingMagicLinkCookie";

function shouldClearPending(path: string | undefined) {
  if (!path) {
    return false;
  }
  return (
    path.startsWith("/magic-link/verify") ||
    path.startsWith("/callback") ||
    path.startsWith("/oauth2/callback") ||
    path.startsWith("/cross-domain/one-time-token/verify")
  );
}

export function pendingMagicLinkPlugin(): BetterAuthPlugin {
  return {
    id: "pending-magic-link",
    hooks: {
      after: [
        {
          matcher: (authCtx) => shouldClearPending(authCtx.path),
          handler: createAuthMiddleware(async (authCtx) => {
            clearPendingMagicLinkCookie(authCtx);
          }),
        },
      ],
    },
    endpoints: {
      getPendingMagicLink: createAuthEndpoint(
        "/pending-magic-link",
        {
          method: "GET",
          requireHeaders: true,
        },
        async (authCtx) => {
          const email = await readPendingMagicLinkEmail(authCtx);
          return authCtx.json({ email });
        },
      ),
    },
  };
}
