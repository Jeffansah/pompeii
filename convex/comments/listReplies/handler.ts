import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { v } from "convex/values";
import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";

import type { Id } from "../../_generated/dataModel";
import { workspaceAuthorizedQuery } from "../../lib/customFunctions/workspaceAuthorizedQuery";
import {
  assertCommentableSubject,
  commentSubjectValidator,
  type CommentSubject,
  subjectKey,
} from "../lib/subjects";
import { toCommentViews } from "../lib/displayNames";
import { commentViewValidator } from "../lib/validators";

export const listReplies = workspaceAuthorizedQuery({
  args: {
    subject: commentSubjectValidator,
    rootId: v.id("comments"),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(commentViewValidator),
  handler: async (ctx, rawArgs) => {
    const args = rawArgs as {
      subject: CommentSubject;
      rootId: Id<"comments">;
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
      throwAppError(AppErrorCode.comments.REPLY_TARGET_NOT_FOUND);
    }
    const root = await ctx.db.get(args.rootId);
    if (
      root === null ||
      root.kind !== "root" ||
      root.threadId !== thread._id ||
      root.weddingId !== ctx.workspace._id
    ) {
      throwAppError(AppErrorCode.comments.REPLY_TARGET_NOT_FOUND);
    }
    const page = await ctx.db
      .query("comments")
      .withIndex("by_threadId_and_rootId_and_isVisible", (q) =>
        q
          .eq("threadId", thread._id)
          .eq("rootId", args.rootId)
          .eq("isVisible", true),
      )
      .order("desc")
      .paginate(args.paginationOpts);
    return {
      ...page,
      page: await toCommentViews(
        ctx,
        page.page,
        ctx.user._id,
        root.deletedAt === null,
      ),
    };
  },
});
