import type { GenericDatabaseReader } from "convex/server";

import type { DataModel, Doc, Id } from "../../_generated/dataModel";
import { memberFor } from "../../weddings/lib/members";
import { toCommentView, type CommentView } from "./validators";

export function liveOrSnapshot(live: string | undefined, snapshot: string) {
  if (live !== undefined && live.length > 0) {
    return live;
  }
  return snapshot;
}

async function memberNamesByUserId(
  ctx: { db: GenericDatabaseReader<DataModel> },
  weddingId: Id<"weddings">,
  userIds: Id<"users">[],
) {
  const unique = [...new Set(userIds)];
  const members = await Promise.all(
    unique.map((userId) => memberFor(ctx, userId, weddingId)),
  );
  return new Map(
    unique.map((userId, index) => [userId, members[index]?.displayName]),
  );
}

export async function toCommentViews(
  ctx: { db: GenericDatabaseReader<DataModel> },
  comments: Doc<"comments">[],
  actorId: Id<"users">,
  rootAllowsReplies = true,
): Promise<CommentView[]> {
  if (comments.length === 0) {
    return [];
  }
  const weddingId = comments[0].weddingId;
  const replyToIds = comments.flatMap((comment) =>
    comment.kind === "reply" ? [comment.replyToId] : [],
  );
  const replyTargets = await Promise.all(
    replyToIds.map((commentId) => ctx.db.get(commentId)),
  );
  const replyToAuthorIds = new Map<Id<"comments">, Id<"users">>();
  for (const target of replyTargets) {
    if (target !== null) {
      replyToAuthorIds.set(target._id, target.authorId);
    }
  }
  const names = await memberNamesByUserId(ctx, weddingId, [
    ...comments.map((comment) => comment.authorId),
    ...replyToAuthorIds.values(),
  ]);
  return comments.map((comment) => {
    const authorName = liveOrSnapshot(
      names.get(comment.authorId),
      comment.authorNameSnapshot,
    );
    if (comment.kind === "root") {
      return toCommentView(comment, actorId, rootAllowsReplies, {
        authorName,
      });
    }
    const replyToAuthorId = replyToAuthorIds.get(comment.replyToId);
    const replyToAuthorName = liveOrSnapshot(
      replyToAuthorId === undefined ? undefined : names.get(replyToAuthorId),
      comment.replyToAuthorNameSnapshot ?? "",
    );
    return toCommentView(comment, actorId, rootAllowsReplies, {
      authorName,
      replyToAuthorName: replyToAuthorName.length > 0 ? replyToAuthorName : null,
    });
  });
}

export async function toLiveCommentView(
  ctx: { db: GenericDatabaseReader<DataModel> },
  comment: Doc<"comments">,
  actorId: Id<"users">,
  rootAllowsReplies = true,
) {
  const [view] = await toCommentViews(
    ctx,
    [comment],
    actorId,
    rootAllowsReplies,
  );
  return view;
}
