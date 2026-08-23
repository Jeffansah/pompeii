import { v } from "convex/values";
import type { GenericValidator, PropertyValidators } from "convex/values";

import { authenticatedMutation } from "./authenticatedMutation";
import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { memberFor } from "../../weddings/lib/members";
import { throwAppError, AppErrorCode } from "@pompeii/errors/convex";

type WorkspaceAuthorizedContext = MutationCtx & {
  authUser: unknown;
  member: Doc<"weddingMembers">;
  sessionId: string;
  user: Doc<"users">;
  workspace: Doc<"weddings">;
};

type AuthenticatedContext = Omit<
  WorkspaceAuthorizedContext,
  "member" | "workspace"
>;

export function workspaceAuthorizedMutation(config: {
  args: PropertyValidators;
  handler: (
    ctx: WorkspaceAuthorizedContext,
    args: Record<string, unknown>,
  ) => unknown;
  returns: GenericValidator | PropertyValidators;
}) {
  return authenticatedMutation({
    ...config,
    args: {
      weddingId: v.id("weddings"),
      ...config.args,
    },
    handler: async (
      ctx: AuthenticatedContext,
      args: { weddingId: Id<"weddings"> },
    ) => {
      const workspace = await ctx.db.get(args.weddingId);
      if (workspace === null) {
        throwAppError(AppErrorCode.weddings.enter.NOT_FOUND);
      }

      const member = await memberFor(ctx, ctx.user._id, workspace._id);
      if (member === null) {
        throwAppError(AppErrorCode.weddings.enter.NOT_FOUND);
      }

      const { weddingId: _weddingId, ...remainingArgs } = args;
      return config.handler(
        { ...ctx, workspace, member } as WorkspaceAuthorizedContext,
        remainingArgs,
      );
    },
  } as never);
}
