import { insertAtTop } from "convex/react";
import type { OptimisticLocalStore } from "convex/browser";
import type { FunctionReturnType } from "convex/server";
import { api } from "@pompeii/api";
import type { Id } from "@pompeii/api";

import type {
  CommentItem,
  CommentReply,
  CommentRoot,
  CommentSubject,
} from "@/types/comments";

type CommentSummary = FunctionReturnType<
  typeof api.comments.summary.handler.summary
>;

function sameSubject(left: CommentSubject, right: CommentSubject) {
  return left.type === right.type && left.taskId === right.taskId;
}

function updateSummary(
  localStore: OptimisticLocalStore,
  weddingId: Id<"weddings">,
  subject: CommentSubject,
  update: (current: CommentSummary) => CommentSummary,
) {
  const args = { weddingId, subject };
  const current = localStore.getQuery(
    api.comments.summary.handler.summary,
    args,
  );
  if (current !== undefined) {
    localStore.setQuery(
      api.comments.summary.handler.summary,
      args,
      update(current),
    );
  }
}

function updateRootPages(
  localStore: OptimisticLocalStore,
  weddingId: Id<"weddings">,
  subject: CommentSubject,
  update: (comment: CommentRoot) => CommentRoot | null,
) {
  for (const query of localStore.getAllQueries(
    api.comments.listRoots.handler.listRoots,
  )) {
    if (
      query.value === undefined ||
      query.args.weddingId !== weddingId ||
      !sameSubject(query.args.subject, subject)
    ) {
      continue;
    }
    const page: CommentItem[] = [];
    for (const comment of query.value.page) {
      if (comment.kind !== "root") {
        page.push(comment);
        continue;
      }
      const next = update(comment);
      if (next !== null) page.push(next);
    }
    localStore.setQuery(api.comments.listRoots.handler.listRoots, query.args, {
      ...query.value,
      page,
    });
  }
}

function updateReplyPages(
  localStore: OptimisticLocalStore,
  weddingId: Id<"weddings">,
  subject: CommentSubject,
  update: (comment: CommentReply) => CommentReply | null,
) {
  for (const query of localStore.getAllQueries(
    api.comments.listReplies.handler.listReplies,
  )) {
    if (
      query.value === undefined ||
      query.args.weddingId !== weddingId ||
      !sameSubject(query.args.subject, subject)
    ) {
      continue;
    }
    const page: CommentItem[] = [];
    for (const comment of query.value.page) {
      if (comment.kind !== "reply") {
        page.push(comment);
        continue;
      }
      const next = update(comment);
      if (next !== null) page.push(next);
    }
    localStore.setQuery(
      api.comments.listReplies.handler.listReplies,
      query.args,
      { ...query.value, page },
    );
  }
}

export function optimisticallyCreateComment(
  localStore: OptimisticLocalStore,
  {
    weddingId,
    subject,
    body,
    clientRequestId,
    replyTo,
    now = Date.now(),
  }: {
    weddingId: Id<"weddings">;
    subject: CommentSubject;
    body: string;
    clientRequestId: string;
    replyTo?: CommentItem;
    now?: number;
  },
) {
  const optimisticId = clientRequestId as Id<"comments">;
  const base = {
    _id: optimisticId,
    _creationTime: now,
    authorId: clientRequestId as Id<"users">,
    authorNameSnapshot: "You",
    clientRequestId,
    body: body.trim(),
    editedAt: null,
    deletedAt: null,
    isDeleted: false,
    isCurrentUser: true,
    capabilities: {
      canEdit: false,
      canDelete: false,
      canReply: false,
    },
  };
  updateSummary(localStore, weddingId, subject, (summary) => ({
    ...summary,
    activeCount: summary.activeCount + 1,
    rootCount:
      replyTo === undefined ? summary.rootCount + 1 : summary.rootCount,
  }));
  if (replyTo === undefined) {
    insertAtTop({
      paginatedQuery: api.comments.listRoots.handler.listRoots,
      argsToMatch: { weddingId, subject },
      localQueryStore: localStore,
      item: { ...base, kind: "root", replyCount: 0 },
    });
    return;
  }
  const rootId = replyTo.kind === "root" ? replyTo._id : replyTo.rootId;
  insertAtTop({
    paginatedQuery: api.comments.listReplies.handler.listReplies,
    argsToMatch: { weddingId, subject, rootId },
    localQueryStore: localStore,
    item: {
      ...base,
      kind: "reply",
      rootId,
      replyToId: replyTo._id,
      replyToAuthorNameSnapshot: replyTo.authorNameSnapshot,
    },
  });
  updateRootPages(localStore, weddingId, subject, (root) =>
    root._id === rootId ? { ...root, replyCount: root.replyCount + 1 } : root,
  );
}

export function optimisticallyUpdateComment(
  localStore: OptimisticLocalStore,
  {
    weddingId,
    subject,
    commentId,
    body,
    now = Date.now(),
  }: {
    weddingId: Id<"weddings">;
    subject: CommentSubject;
    commentId: Id<"comments">;
    body: string;
    now?: number;
  },
) {
  const patch = <Comment extends CommentItem>(comment: Comment) =>
    comment._id === commentId
      ? { ...comment, body: body.trim(), editedAt: now }
      : comment;
  updateRootPages(localStore, weddingId, subject, patch);
  updateReplyPages(localStore, weddingId, subject, patch);
}

export function optimisticallyRemoveComment(
  localStore: OptimisticLocalStore,
  {
    weddingId,
    subject,
    comment,
    now = Date.now(),
  }: {
    weddingId: Id<"weddings">;
    subject: CommentSubject;
    comment: CommentItem;
    now?: number;
  },
) {
  updateSummary(localStore, weddingId, subject, (summary) => ({
    ...summary,
    activeCount: Math.max(0, summary.activeCount - 1),
    rootCount:
      comment.kind === "root"
        ? Math.max(0, summary.rootCount - 1)
        : summary.rootCount,
  }));
  if (comment.kind === "root") {
    updateRootPages(localStore, weddingId, subject, (root) => {
      if (root._id !== comment._id) return root;
      if (root.replyCount === 0) return null;
      return {
        ...root,
        body: "",
        deletedAt: now,
        isDeleted: true,
        capabilities: {
          canEdit: false,
          canDelete: false,
          canReply: false,
        },
      };
    });
    updateReplyPages(localStore, weddingId, subject, (reply) =>
      reply.rootId === comment._id
        ? {
            ...reply,
            capabilities: {
              ...reply.capabilities,
              canReply: false,
            },
          }
        : reply,
    );
    return;
  }
  updateReplyPages(localStore, weddingId, subject, (reply) =>
    reply._id === comment._id ? null : reply,
  );
  updateRootPages(localStore, weddingId, subject, (root) => {
    if (root._id !== comment.rootId) return root;
    const replyCount = Math.max(0, root.replyCount - 1);
    return root.isDeleted && replyCount === 0 ? null : { ...root, replyCount };
  });
}
