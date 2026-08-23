import { v, type Infer } from "convex/values";
import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";

import type { Doc, Id } from "../../_generated/dataModel";

export const COMMENT_BODY_MAX_LENGTH = 5000;
export const CLIENT_REQUEST_ID_MAX_LENGTH = 64;

export const commentCapabilitiesValidator = v.object({
  canEdit: v.boolean(),
  canDelete: v.boolean(),
  canReply: v.boolean(),
});

const commentViewFields = {
  _id: v.id("comments"),
  _creationTime: v.number(),
  authorId: v.id("users"),
  authorNameSnapshot: v.string(),
  clientRequestId: v.string(),
  body: v.string(),
  editedAt: v.union(v.number(), v.null()),
  deletedAt: v.union(v.number(), v.null()),
  isDeleted: v.boolean(),
  isCurrentUser: v.boolean(),
  capabilities: commentCapabilitiesValidator,
};

export const commentViewValidator = v.union(
  v.object({
    ...commentViewFields,
    kind: v.literal("root"),
    replyCount: v.number(),
  }),
  v.object({
    ...commentViewFields,
    kind: v.literal("reply"),
    rootId: v.id("comments"),
    replyToId: v.id("comments"),
    replyToAuthorNameSnapshot: v.union(v.string(), v.null()),
  }),
);

export function validateCommentBody(body: string) {
  const trimmed = body.trim();
  if (trimmed.length === 0) {
    throwAppError(AppErrorCode.comments.BODY_REQUIRED);
  }
  if (trimmed.length > COMMENT_BODY_MAX_LENGTH) {
    throwAppError(AppErrorCode.comments.BODY_TOO_LONG);
  }
  return trimmed;
}

export function validateClientRequestId(clientRequestId: string) {
  if (
    clientRequestId.length === 0 ||
    clientRequestId.length > CLIENT_REQUEST_ID_MAX_LENGTH
  ) {
    throwAppError(AppErrorCode.comments.CLIENT_REQUEST_ID_INVALID);
  }
}

export type CommentView = Infer<typeof commentViewValidator>;

export function toCommentView(
  comment: Doc<"comments">,
  actorId: Id<"users">,
  rootAllowsReplies = true,
  names?: {
    authorName: string;
    replyToAuthorName?: string | null;
  },
): CommentView {
  const isDeleted = comment.deletedAt !== null;
  const base = {
    _id: comment._id,
    _creationTime: comment._creationTime,
    authorId: comment.authorId,
    authorNameSnapshot: names?.authorName ?? comment.authorNameSnapshot,
    clientRequestId: comment.clientRequestId,
    body: isDeleted ? "" : comment.body,
    editedAt: comment.editedAt,
    deletedAt: comment.deletedAt,
    isDeleted,
    isCurrentUser: comment.authorId === actorId,
    capabilities: {
      canEdit: !isDeleted && comment.authorId === actorId,
      canDelete: !isDeleted && comment.authorId === actorId,
      canReply: !isDeleted && rootAllowsReplies,
    },
  };
  if (comment.kind === "root") {
    return { ...base, kind: "root", replyCount: comment.replyCount };
  }
  return {
    ...base,
    kind: "reply",
    rootId: comment.rootId,
    replyToId: comment.replyToId,
    replyToAuthorNameSnapshot:
      names?.replyToAuthorName ?? comment.replyToAuthorNameSnapshot,
  };
}
