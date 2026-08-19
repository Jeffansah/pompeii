import { customCtx, customQuery } from "convex-helpers/server/customFunctions";

import { requireAppUser, requireAuthUser, requireSessionId } from "../auth/functions";
import { query } from "../../_generated/server";

export const authenticatedQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    const authUser = await requireAuthUser(ctx);
    const user = await requireAppUser(ctx, authUser._id);
    const sessionId = await requireSessionId(ctx);
    return { authUser, user, sessionId };
  }),
);
