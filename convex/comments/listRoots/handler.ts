import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";

import { workspaceAuthorizedQuery } from "../../lib/customFunctions/workspaceAuthorizedQuery";
import {
  assertCommentableSubject,
  commentSubjectValidator,
  type CommentSubject,
  subjectKey,
} from "../lib/subjects";
import { toCommentViews } from "../lib/displayNames";
import { commentViewValidator } from "../lib/validators";

export const listRoots = workspaceAuthorizedQuery({
  args: {
    subject: commentSubjectValidator,
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(commentViewValidator),
  handler: async (ctx, rawArgs) => {
    const args = rawArgs as {
      subject: CommentSubject;
      paginationOpts: {
        numItems: number;
        cursor: string | null;
        endCursor?: string | null;
        maximumRowsRead?: number;
        maximumBytesRead?: number;
        id?: number;
      };
    };
    await assertCommentableSubject(ctx, ctx.workspace._id, args.subject);
    const thread = await ctx.db
      .query("commentThreads")
      .withIndex("by_weddingId_and_subjectKey", (q) =>
        q
          .eq("weddingId", ctx.workspace._id)
          .eq("subjectKey", subjectKey(args.subject)),
      )
      .unique();
    if (thread === null) {
      return { page: [], isDone: true, continueCursor: "" };
    }
    const page = await ctx.db
      .query("comments")
      .withIndex("by_threadId_and_rootId_and_isVisible", (q) =>
        q.eq("threadId", thread._id).eq("rootId", null).eq("isVisible", true),
      )
      .order("desc")
      .paginate(args.paginationOpts);
    return {
      ...page,
      page: await toCommentViews(ctx, page.page, ctx.user._id),
    };
  },
});
