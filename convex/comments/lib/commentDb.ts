import type { DataModel, Doc, Id } from "../../_generated/dataModel";
import type { GenericDatabaseReader } from "convex/server";
import type { MutationCtx } from "../../_generated/server";
import type { CommentSubject } from "./subjects";
import { subjectKey } from "./subjects";

export async function getThread(
  ctx: { db: GenericDatabaseReader<DataModel> },
  weddingId: Id<"weddings">,
  subject: CommentSubject,
) {
  return ctx.db
    .query("commentThreads")
    .withIndex("by_weddingId_and_subjectKey", (q) =>
      q.eq("weddingId", weddingId).eq("subjectKey", subjectKey(subject)),
    )
    .unique();
}

export async function getOrCreateThread(
  ctx: MutationCtx,
  weddingId: Id<"weddings">,
  subject: CommentSubject,
) {
  const existing = await getThread(ctx, weddingId, subject);
  if (existing !== null) {
    return existing;
  }
  const threadId = await ctx.db.insert("commentThreads", {
    weddingId,
    subject,
    subjectKey: subjectKey(subject),
    activeCount: 0,
    rootCount: 0,
    lastCommentAt: null,
  });
  return (await ctx.db.get(threadId))!;
}

export async function insertRoot(
  ctx: MutationCtx,
  thread: Doc<"commentThreads">,
  weddingId: Id<"weddings">,
  authorId: Id<"users">,
  authorNameSnapshot: string,
  body: string,
  clientRequestId: string,
) {
  const now = Date.now();
  const [commentId] = await Promise.all([
    ctx.db.insert("comments", {
      kind: "root",
      weddingId,
      threadId: thread._id,
      rootId: null,
      replyToId: null,
      replyToAuthorNameSnapshot: null,
      authorId,
      authorNameSnapshot,
      body,
      editedAt: null,
      deletedAt: null,
      isVisible: true,
      clientRequestId,
      replyCount: 0,
    }),
    ctx.db.patch(thread._id, {
      activeCount: thread.activeCount + 1,
      rootCount: thread.rootCount + 1,
      lastCommentAt: now,
    }),
  ]);
  return (await ctx.db.get(commentId))!;
}

export async function insertReply(
  ctx: MutationCtx,
  thread: Doc<"commentThreads">,
  root: Extract<Doc<"comments">, { kind: "root" }>,
  weddingId: Id<"weddings">,
  authorId: Id<"users">,
  authorNameSnapshot: string,
  body: string,
  clientRequestId: string,
  replyToId: Id<"comments">,
  replyToAuthorNameSnapshot: string,
) {
  const now = Date.now();
  const [commentId] = await Promise.all([
    ctx.db.insert("comments", {
      kind: "reply",
      weddingId,
      threadId: thread._id,
      rootId: root._id,
      replyToId,
      replyToAuthorNameSnapshot,
      authorId,
      authorNameSnapshot,
      body,
      editedAt: null,
      deletedAt: null,
      isVisible: true,
      clientRequestId,
      replyCount: 0,
    }),
    ctx.db.patch(thread._id, {
      activeCount: thread.activeCount + 1,
      lastCommentAt: now,
    }),
    ctx.db.patch(root._id, { replyCount: root.replyCount + 1 }),
  ]);
  return (await ctx.db.get(commentId))!;
}

export async function decrementCounts(
  ctx: MutationCtx,
  comment: {
    kind: "root" | "reply";
    threadId: Id<"commentThreads">;
    rootId: Id<"comments"> | null;
  },
) {
  const [thread, root] = await Promise.all([
    ctx.db.get(comment.threadId),
    comment.kind === "reply" && comment.rootId !== null
      ? ctx.db.get(comment.rootId)
      : Promise.resolve(null),
  ]);
  if (thread === null) {
    throw new Error("Comment thread not found");
  }
  await Promise.all([
    ctx.db.patch(comment.threadId, {
      activeCount: Math.max(0, thread.activeCount - 1),
      ...(comment.kind === "root"
        ? { rootCount: Math.max(0, thread.rootCount - 1) }
        : {}),
    }),
    ...(root?.kind === "root"
      ? [
          ctx.db.patch(root._id, {
            replyCount: Math.max(0, root.replyCount - 1),
            ...(root.deletedAt !== null && root.replyCount <= 1
              ? { isVisible: false }
              : {}),
          }),
        ]
      : []),
  ]);
}
