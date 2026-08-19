import {
  customCtx,
  customMutation,
} from "convex-helpers/server/customFunctions";

import { ensureAppUser, requireAuthUser, requireSessionId } from "../auth/functions";
import { mutation } from "../../_generated/server";

export const authenticatedMutation = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const authUser = await requireAuthUser(ctx);
    const user = await ensureAppUser(ctx, authUser._id);
    const sessionId = await requireSessionId(ctx);
    return { authUser, user, sessionId };
  }),
);
