import { v } from "convex/values";
import {
  customCtxAndArgs,
  customQuery,
} from "convex-helpers/server/customFunctions";
import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";

import { query } from "../../_generated/server";
import {
  requireAppUser,
  requireAuthUser,
  requireSessionId,
} from "../auth/functions";
import { memberFor } from "../../weddings/lib/members";

export const workspaceAuthorizedQuery = customQuery(
  query,
  customCtxAndArgs({
    args: { weddingId: v.id("weddings") },
    input: async (ctx, args) => {
      const authUser = await requireAuthUser(ctx);
      const user = await requireAppUser(ctx, authUser._id);
      const sessionId = await requireSessionId(ctx);
      const workspace = await ctx.db.get(args.weddingId);
      if (workspace === null) {
        throwAppError(AppErrorCode.weddings.enter.NOT_FOUND);
      }
      const member = await memberFor(ctx, user._id, workspace._id);
      if (member === null) {
        throwAppError(AppErrorCode.weddings.enter.NOT_FOUND);
      }
      return {
        ctx: {
          authUser,
          user,
          sessionId,
          workspace,
          member,
        },
        args: {},
      };
    },
  }),
);
