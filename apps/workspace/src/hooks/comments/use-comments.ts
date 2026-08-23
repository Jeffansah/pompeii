import { useMemo } from "react";
import { usePaginatedQuery, useQuery as useConvexQuery } from "convex/react";
import { api } from "@pompeii/api";
import type { Id } from "@pompeii/api";

import { chronologicalReplies } from "@/lib/comments/comment-display";
import type {
  CommentReply,
  CommentRoot,
  CommentSubject,
} from "@/types/comments";

const ROOT_PAGE_SIZE = 20;
const REPLY_PAGE_SIZE = 10;

export function useCommentSummary(
  weddingId: Id<"weddings">,
  subject: CommentSubject,
) {
  return useConvexQuery(api.comments.summary.handler.summary, {
    weddingId,
    subject,
  });
}

export function useCommentRoots(
  weddingId: Id<"weddings">,
  subject: CommentSubject,
) {
  const result = usePaginatedQuery(
    api.comments.listRoots.handler.listRoots,
    { weddingId, subject },
    { initialNumItems: ROOT_PAGE_SIZE },
  );
  return { ...result, results: result.results as CommentRoot[] };
}

export function useCommentReplies(
  weddingId: Id<"weddings">,
  subject: CommentSubject,
  rootId: Id<"comments"> | null,
) {
  const result = usePaginatedQuery(
    api.comments.listReplies.handler.listReplies,
    rootId === null ? "skip" : { weddingId, subject, rootId },
    { initialNumItems: REPLY_PAGE_SIZE },
  );
  const chronologicalResults = useMemo(
    () => chronologicalReplies(result.results as CommentReply[]),
    [result.results],
  );
  return {
    ...result,
    results: chronologicalResults,
  };
}
