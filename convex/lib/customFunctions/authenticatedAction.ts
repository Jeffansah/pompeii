import {
  customAction,
  customCtx,
} from "convex-helpers/server/customFunctions";

import { requireAuthUser, requireSessionId } from "../auth/functions";
import { action } from "../../_generated/server";

export const authenticatedAction = customAction(
  action,
  customCtx(async (ctx) => {
    const authUser = await requireAuthUser(ctx);
    const sessionId = await requireSessionId(ctx);
    return { authUser, sessionId };
  }),
);
