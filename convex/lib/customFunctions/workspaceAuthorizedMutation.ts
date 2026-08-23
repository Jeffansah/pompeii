import { v } from "convex/values";
import {
  customCtxAndArgs,
  customMutation,
} from "convex-helpers/server/customFunctions";
import { throwAppError, AppErrorCode } from "@pompeii/errors/convex";

import { mutation } from "../../_generated/server";
import {
  ensureAppUser,
  requireAuthUser,
  requireSessionId,
} from "../auth/functions";
import { memberFor } from "../../weddings/lib/members";

export const workspaceAuthorizedMutation = customMutation(
  mutation,
  customCtxAndArgs({
    args: { weddingId: v.id("weddings") },
    input: async (ctx, args) => {
      const authUser = await requireAuthUser(ctx);
      const user = await ensureAppUser(ctx, authUser._id);
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
