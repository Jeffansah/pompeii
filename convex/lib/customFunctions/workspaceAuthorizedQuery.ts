import { v } from "convex/values";
import type { GenericValidator, PropertyValidators } from "convex/values";

import { authenticatedQuery } from "./authenticatedQuery";
import type { Doc, Id } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";
import { memberFor } from "../../weddings/lib/members";

type WorkspaceAuthorizedContext = QueryCtx & {
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

export function workspaceAuthorizedQuery(config: {
  args: PropertyValidators;
  handler: (
    ctx: WorkspaceAuthorizedContext,
    args: Record<string, unknown>,
  ) => unknown;
  returns: GenericValidator | PropertyValidators;
}) {
  return authenticatedQuery({
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
        return null;
      }

      const member = await memberFor(ctx, ctx.user._id, workspace._id);
      if (member === null) {
        return null;
      }

      const { weddingId: _weddingId, ...remainingArgs } = args;
      return config.handler(
        { ...ctx, workspace, member } as WorkspaceAuthorizedContext,
        remainingArgs,
      );
    },
  } as never);
}
