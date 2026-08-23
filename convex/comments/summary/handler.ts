import { v } from "convex/values";

import { workspaceAuthorizedQuery } from "../../lib/customFunctions/workspaceAuthorizedQuery";
import {
  assertCommentableSubject,
  commentSubjectValidator,
  type CommentSubject,
  subjectKey,
} from "../lib/subjects";

const summaryValidator = v.object({
  activeCount: v.number(),
  rootCount: v.number(),
  canPost: v.boolean(),
  canReply: v.boolean(),
});

export const summary = workspaceAuthorizedQuery({
  args: { subject: commentSubjectValidator },
  returns: summaryValidator,
  handler: async (ctx, rawArgs) => {
    const { subject } = rawArgs as { subject: CommentSubject };
    await assertCommentableSubject(ctx, ctx.workspace._id, subject);
    const thread = await ctx.db
      .query("commentThreads")
      .withIndex("by_weddingId_and_subjectKey", (q) =>
        q
          .eq("weddingId", ctx.workspace._id)
          .eq("subjectKey", subjectKey(subject)),
      )
      .unique();
    return {
      activeCount: thread?.activeCount ?? 0,
      rootCount: thread?.rootCount ?? 0,
      canPost: true,
      canReply: true,
    };
  },
});
