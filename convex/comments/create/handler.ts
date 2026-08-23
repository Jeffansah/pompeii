import { v } from "convex/values";

import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";
import type { Id } from "../../_generated/dataModel";
import { workspaceAuthorizedMutation } from "../../lib/customFunctions/workspaceAuthorizedMutation";
import { rateLimiter } from "../../lib/auth/rateLimit";
import { getOrCreateThread, insertReply, insertRoot } from "../lib/commentDb";
import {
  assertCommentableSubject,
  commentSubjectValidator,
  subjectKey,
  type CommentSubject,
} from "../lib/subjects";
import { toLiveCommentView } from "../lib/displayNames";
import {
  commentViewValidator,
  validateClientRequestId,
  validateCommentBody,
} from "../lib/validators";

export const create = workspaceAuthorizedMutation({
  args: {
    subject: commentSubjectValidator,
    body: v.string(),
    clientRequestId: v.string(),
    replyToId: v.optional(v.id("comments")),
  },
  returns: commentViewValidator,
  handler: async (ctx, rawArgs) => {
    const args = rawArgs as {
      subject: CommentSubject;
      body: string;
      clientRequestId: string;
      replyToId?: Id<"comments">;
    };
    validateClientRequestId(args.clientRequestId);
    const body = validateCommentBody(args.body);
    await assertCommentableSubject(ctx, ctx.workspace._id, args.subject);

    const existing = await ctx.db
      .query("comments")
      .withIndex("by_authorId_and_clientRequestId", (q) =>
        q
          .eq("authorId", ctx.user._id)
          .eq("clientRequestId", args.clientRequestId),
      )
      .unique();
    if (existing !== null) {
      const thread = await ctx.db.get(existing.threadId);
      const matches =
        thread?.subjectKey === subjectKey(args.subject) &&
        existing.body === body &&
        (existing.replyToId ?? null) === (args.replyToId ?? null);
      if (!matches) {
        throwAppError(AppErrorCode.comments.IDEMPOTENCY_CONFLICT);
      }
      const root =
        existing.kind === "reply"
          ? await ctx.db.get(existing.rootId)
          : existing;
      return toLiveCommentView(
        ctx,
        existing,
        ctx.user._id,
        root?.kind === "root" && root.deletedAt === null,
      );
    }

    const limited = await rateLimiter.limit(ctx, "commentPost", {
      key: `${ctx.workspace._id}:${ctx.user._id}`,
    });
    if (!limited.ok) {
      throwAppError(AppErrorCode.comments.RATE_LIMITED);
    }

    const thread = await getOrCreateThread(
      ctx,
      ctx.workspace._id,
      args.subject,
    );
    const authorNameSnapshot = ctx.member.displayName ?? "";
    if (args.replyToId === undefined) {
      const comment = await insertRoot(
        ctx,
        thread,
        ctx.workspace._id,
        ctx.user._id,
        authorNameSnapshot,
        body,
        args.clientRequestId,
      );
      return toLiveCommentView(ctx, comment, ctx.user._id);
    }

    const target = await ctx.db.get(args.replyToId);
    if (
      target === null ||
      target.threadId !== thread._id ||
      target.weddingId !== ctx.workspace._id
    ) {
      throwAppError(AppErrorCode.comments.REPLY_TARGET_NOT_FOUND);
    }
    if (target.deletedAt !== null) {
      throwAppError(AppErrorCode.comments.REPLY_TARGET_DELETED);
    }
    const rootId = target.kind === "root" ? target._id : target.rootId;
    const root = await ctx.db.get(rootId);
    if (root === null || root.kind !== "root" || root.deletedAt !== null) {
      throwAppError(AppErrorCode.comments.REPLY_TARGET_DELETED);
    }
    const comment = await insertReply(
      ctx,
      thread,
      root,
      ctx.workspace._id,
      ctx.user._id,
      authorNameSnapshot,
      body,
      args.clientRequestId,
      args.replyToId,
      target.authorNameSnapshot,
    );
    return toLiveCommentView(ctx, comment, ctx.user._id);
  },
});
