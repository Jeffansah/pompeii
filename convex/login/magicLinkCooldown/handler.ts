import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";

import { rateLimiter } from "../../lib/auth/rateLimit";
import { normalizeEmail } from "../../lib/auth/normalizeEmail";
import type { DataModel } from "../../_generated/dataModel";

export const { getRateLimit, getServerTime } = rateLimiter.hookAPI<DataModel>(
  "magicLinkCooldown",
  {
    key: (_ctx, keyFromClient) => {
      const email = normalizeEmail(keyFromClient ?? "");
      if (!email) {
        throwAppError(AppErrorCode.login.magicLink.EMAIL_REQUIRED);
      }
      return email;
    },
  },
);
