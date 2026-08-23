import { formatDistance } from "date-fns";

import type { CommentItem, CommentReply } from "@/types/comments";

export function commentRenderKey(comment: CommentItem) {
  return comment.clientRequestId;
}

export function chronologicalReplies(replies: readonly CommentReply[]) {
  return [...replies].reverse();
}

export function formatCommentRelativeTime(
  creationTime: number,
  now = Date.now(),
) {
  return formatDistance(creationTime, now, { addSuffix: true });
}

export function formatCommentAbsoluteTime(creationTime: number) {
  return new Date(creationTime).toLocaleString();
}
