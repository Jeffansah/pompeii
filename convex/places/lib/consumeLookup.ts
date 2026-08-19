import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";
import type { GenericActionCtx } from "convex/server";

import type { DataModel } from "../../_generated/dataModel";
import { rateLimiter } from "../../lib/auth/rateLimit";

export async function consumePlacesLookup(
  ctx: GenericActionCtx<DataModel>,
  userId: string,
) {
  const result = await rateLimiter.limit(ctx, "placesLookup", {
    key: userId,
  });
  if (!result.ok) {
    throwAppError(AppErrorCode.places.RATE_LIMITED);
  }
}
