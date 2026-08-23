import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { Id } from "@pompeii/api";

import { CommentComposer } from "@/components/comments/comment-composer";
import { CommentDeleteDialog } from "@/components/comments/comment-delete-dialog";
import { CommentEmptyState } from "@/components/comments/comment-empty-state";
import { CommentRootList } from "@/components/comments/comment-root-list";
import { CommentSkeleton } from "@/components/comments/comment-skeleton";
import { SkeletonReveal } from "@/components/ui/skeleton-reveal";
import { CommentThread } from "@/components/comments/comment-thread";
import { CommentsHeader } from "@/components/comments/comments-header";
import { Button } from "@/components/ui/button";
import { useCommentActions } from "@/hooks/comments/use-comment-actions";
import {
  useCommentReplies,
  useCommentRoots,
  useCommentSummary,
} from "@/hooks/comments/use-comments";
import { commentRenderKey } from "@/lib/comments/comment-display";
import {
  prefersReducedMotion,
  scrollCommentIntoView,
} from "@/lib/comments/preserve-scroll-anchor";
import { updateReplyDraft } from "@/lib/comments/reply-drafts";
import type {
  CommentItem,
  CommentReply,
  CommentSubject,
} from "@/types/comments";

const EMPTY_PENDING_IDS: ReadonlySet<string> = new Set();
const EMPTY_REPLIES: CommentReply[] = [];
const NO_COMMENT_ERROR: (commentId: Id<"comments">) => string | null = () =>
  null;

export function CommentsSection({
  weddingId,
  subject,
}: {
  weddingId: Id<"weddings">;
  subject: CommentSubject;
}) {
  return (
    <CommentsSectionContent
      key={`${weddingId}:${subject.type}:${subject.taskId}`}
      subject={subject}
      weddingId={weddingId}
    />
  );
}

function CommentsSectionContent({
  weddingId,
  subject,
}: {
  weddingId: Id<"weddings">;
  subject: CommentSubject;
}) {
  const summary = useCommentSummary(weddingId, subject);
  const roots = useCommentRoots(weddingId, subject);
  const [expandedRootId, setExpandedRootId] = useState<Id<"comments"> | null>(
    null,
  );
  const [subscribedRootId, setSubscribedRootId] =
    useState<Id<"comments"> | null>(null);
  const [activeReplyId, setActiveReplyId] = useState<Id<"comments"> | null>(
    null,
  );
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [commentToDelete, setCommentToDelete] = useState<CommentItem | null>(
    null,
  );
  const replyTriggerRef = useRef<HTMLButtonElement | null>(null);
  const deleteTriggerRef = useRef<HTMLButtonElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const headingId = useId();
  const replyCacheRef = useRef(new Map<Id<"comments">, CommentReply[]>());
  const collapseTimerRef = useRef<number | null>(null);
  const replies = useCommentReplies(weddingId, subject, subscribedRootId);
  const loadMoreReplies = replies.loadMore;
  const {
    clearError,
    create,
    errorForComment,
    errorForReply,
    isReplyCreatePending,
    pendingIds,
    remove,
    rootCreatePending,
    rootError,
    update,
  } = useCommentActions({ weddingId, subject });
  useEffect(() => {
    if (subscribedRootId !== null && replies.status !== "LoadingFirstPage") {
      replyCacheRef.current.set(subscribedRootId, replies.results);
    }
  }, [replies.results, replies.status, subscribedRootId]);

  const clearCollapseTimer = useCallback(() => {
    if (collapseTimerRef.current !== null) {
      window.clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
  }, []);
  useEffect(() => clearCollapseTimer, [clearCollapseTimer]);
  useEffect(() => {
    if (expandedRootId === null) return;
    const expandedRoot = roots.results.find(
      (root) => root._id === expandedRootId,
    );
    const composingFirstReply =
      expandedRoot !== undefined &&
      expandedRoot.replyCount === 0 &&
      activeReplyId === expandedRoot._id &&
      expandedRoot.capabilities.canReply;
    if (
      expandedRoot !== undefined &&
      (expandedRoot.replyCount > 0 || composingFirstReply)
    ) {
      return;
    }
    clearCollapseTimer();
    setActiveReplyId(null);
    setExpandedRootId(null);
    setSubscribedRootId(null);
  }, [activeReplyId, clearCollapseTimer, expandedRootId, roots.results]);

  const finishCollapse = useCallback(
    (rootId: Id<"comments">) => {
      clearCollapseTimer();
      setSubscribedRootId((current) => (current === rootId ? null : current));
    },
    [clearCollapseTimer],
  );
  const restoreReplyFocus = useCallback(() => {
    queueMicrotask(() => replyTriggerRef.current?.focus());
  }, []);
  const closeReplyComposer = useCallback(() => {
    setActiveReplyId(null);
    restoreReplyFocus();
  }, [restoreReplyFocus]);
  const handleReply = useCallback(
    (comment: CommentItem, trigger: HTMLButtonElement) => {
      const rootId = comment.kind === "root" ? comment._id : comment.rootId;
      clearCollapseTimer();
      clearError();
      replyTriggerRef.current = trigger;
      setSubscribedRootId(rootId);
      setExpandedRootId(rootId);
      setActiveReplyId(comment._id);
    },
    [clearCollapseTimer, clearError],
  );
  const handleToggle = useCallback(
    (rootId: Id<"comments">) => {
      clearCollapseTimer();
      if (expandedRootId === rootId) {
        if (activeReplyId !== null) restoreReplyFocus();
        setActiveReplyId(null);
        setExpandedRootId(null);
        if (prefersReducedMotion()) {
          finishCollapse(rootId);
        } else {
          collapseTimerRef.current = window.setTimeout(
            () => finishCollapse(rootId),
            300,
          );
        }
        return;
      }
      setActiveReplyId(null);
      setSubscribedRootId(rootId);
      setExpandedRootId(rootId);
    },
    [
      activeReplyId,
      clearCollapseTimer,
      expandedRootId,
      finishCollapse,
      restoreReplyFocus,
    ],
  );
  const handleDraftChange = useCallback(
    (rootId: Id<"comments">, body: string) => {
      setReplyDrafts((current) => updateReplyDraft(current, rootId, body));
    },
    [],
  );
  const handleUpdate = useCallback(
    async (comment: CommentItem, body: string) => {
      await update(comment._id, body);
    },
    [update],
  );
  const handleRemove = useCallback(
    (comment: CommentItem, trigger: HTMLButtonElement | null) => {
      clearError();
      deleteTriggerRef.current = trigger;
      setCommentToDelete(comment);
    },
    [clearError],
  );
  const handleLoadMoreReplies = useCallback(
    () => loadMoreReplies(10),
    [loadMoreReplies],
  );
  const postRoot = useCallback(
    async (body: string) => {
      await create(body);
    },
    [create],
  );
  const postReply = useCallback(
    async (body: string, replyTo: CommentItem): Promise<void> => {
      const rootId = replyTo.kind === "root" ? replyTo._id : replyTo.rootId;
      const created = await create(body, replyTo);
      setReplyDrafts((current) => updateReplyDraft(current, rootId, ""));
      setActiveReplyId(null);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!scrollCommentIntoView(created._id)) {
            window.setTimeout(() => scrollCommentIntoView(created._id), 100);
          }
        });
      });
    },
    [create],
  );

  const ready = summary !== undefined && roots.status !== "LoadingFirstPage";
  return (
    <SkeletonReveal
      className="mt-10"
      ready={ready}
      skeleton={<CommentSkeleton />}
    >
      {summary !== undefined && roots.status !== "LoadingFirstPage" ? (
        <section aria-labelledby={headingId}>
          <CommentsHeader
            count={summary.activeCount}
            headingRef={headingRef}
            id={headingId}
          />
          {summary.canPost ? (
            <div className="mt-5">
              <CommentComposer
                error={rootError}
                label="Add a comment"
                onSubmit={postRoot}
                pending={rootCreatePending}
                refocusAfterSubmit
              />
            </div>
          ) : null}
          {roots.results.length === 0 ? (
            <CommentEmptyState />
          ) : (
            <CommentRootList>
              {roots.results.map((item) => (
                <CommentThread
                  activeReplyId={
                    expandedRootId === item._id ? activeReplyId : null
                  }
                  canLoadMore={
                    expandedRootId === item._id &&
                    (replies.status === "CanLoadMore" ||
                      replies.status === "LoadingMore")
                  }
                  commentError={
                    expandedRootId === item._id
                      ? errorForComment
                      : NO_COMMENT_ERROR
                  }
                  expanded={expandedRootId === item._id}
                  key={commentRenderKey(item)}
                  loadingFirstPage={
                    expandedRootId === item._id &&
                    replies.status === "LoadingFirstPage" &&
                    !replyCacheRef.current.has(item._id)
                  }
                  loadingMore={
                    expandedRootId === item._id &&
                    replies.status === "LoadingMore"
                  }
                  onCancelReply={closeReplyComposer}
                  onDisclosureTransitionEnd={finishCollapse}
                  onDraftChange={handleDraftChange}
                  onEditStart={clearError}
                  onLoadMore={handleLoadMoreReplies}
                  onPostReply={postReply}
                  onRemove={handleRemove}
                  onReply={handleReply}
                  onToggle={handleToggle}
                  onUpdate={handleUpdate}
                  pendingIds={
                    expandedRootId === item._id ? pendingIds : EMPTY_PENDING_IDS
                  }
                  replyPending={isReplyCreatePending(item._id)}
                  replies={
                    expandedRootId === item._id &&
                    replies.status !== "LoadingFirstPage"
                      ? replies.results
                      : (replyCacheRef.current.get(item._id) ?? EMPTY_REPLIES)
                  }
                  replyDraft={replyDrafts[item._id] ?? ""}
                  replyError={errorForReply(item._id)}
                  root={item}
                  rootError={errorForComment(item._id)}
                  rootPending={pendingIds.has(String(item._id))}
                  rootSending={pendingIds.has(item.clientRequestId)}
                />
              ))}
            </CommentRootList>
          )}
          {roots.status === "CanLoadMore" || roots.status === "LoadingMore" ? (
            <Button
              className="mt-4"
              onClick={() => roots.loadMore(20)}
              pending={roots.status === "LoadingMore"}
              variant="link"
            >
              Load older comments
            </Button>
          ) : null}
          <CommentDeleteDialog
            comment={commentToDelete}
            error={
              commentToDelete === null
                ? null
                : errorForComment(commentToDelete._id)
            }
            onConfirm={() => {
              if (commentToDelete === null) return;
              void remove(commentToDelete)
                .then(() => {
                  deleteTriggerRef.current = null;
                  setCommentToDelete(null);
                  queueMicrotask(() => headingRef.current?.focus());
                })
                .catch(() => undefined);
            }}
            onOpenChange={(open) => {
              if (
                !open &&
                (commentToDelete === null ||
                  !pendingIds.has(String(commentToDelete._id)))
              ) {
                setCommentToDelete(null);
                queueMicrotask(() =>
                  (deleteTriggerRef.current ?? headingRef.current)?.focus(),
                );
              }
            }}
            pending={
              commentToDelete !== null &&
              pendingIds.has(String(commentToDelete._id))
            }
          />
        </section>
      ) : null}
    </SkeletonReveal>
  );
}
