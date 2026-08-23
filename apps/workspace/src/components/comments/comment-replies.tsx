import { useLayoutEffect, useRef } from "react";
import type { Id } from "@pompeii/api";

import { CommentComposer } from "@/components/comments/comment-composer";
import { CommentItem } from "@/components/comments/comment-item";
import { CommentRepliesSkeleton } from "@/components/comments/comment-skeleton";
import { Button } from "@/components/ui/button";
import { SkeletonReveal } from "@/components/ui/skeleton-reveal";
import { commentRenderKey } from "@/lib/comments/comment-display";
import {
  captureFirstCommentAnchor,
  restoreCommentAnchor,
  type CommentScrollAnchor,
} from "@/lib/comments/preserve-scroll-anchor";
import type {
  CommentItem as CommentItemData,
  CommentReply,
  CommentRoot,
} from "@/types/comments";

export function CommentReplies({
  root,
  expanded,
  replies,
  loadingFirstPage,
  loadingMore,
  replyError,
  replyDraft,
  activeReplyId,
  canLoadMore,
  pendingIds,
  replyPending,
  commentError,
  onCancelReply,
  onDisclosureTransitionEnd,
  onDraftChange,
  onEditStart,
  onLoadMore,
  onPostReply,
  onRemove,
  onReply,
  onUpdate,
}: {
  root: CommentRoot;
  expanded: boolean;
  replies: CommentReply[];
  loadingFirstPage: boolean;
  loadingMore: boolean;
  replyError?: string | null;
  replyDraft: string;
  activeReplyId: Id<"comments"> | null;
  canLoadMore: boolean;
  pendingIds: ReadonlySet<string>;
  replyPending: boolean;
  commentError: (commentId: Id<"comments">) => string | null;
  onCancelReply: () => void;
  onDisclosureTransitionEnd: (rootId: Id<"comments">) => void;
  onDraftChange: (rootId: Id<"comments">, body: string) => void;
  onEditStart: () => void;
  onLoadMore: () => void;
  onPostReply: (body: string, replyTo: CommentItemData) => Promise<void>;
  onRemove: (
    comment: CommentRoot | CommentReply,
    trigger: HTMLButtonElement | null,
  ) => void;
  onReply: (
    comment: CommentRoot | CommentReply,
    trigger: HTMLButtonElement,
  ) => void;
  onUpdate: (
    comment: CommentRoot | CommentReply,
    body: string,
  ) => Promise<void>;
}) {
  const repliesRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<CommentScrollAnchor | null>(null);
  const target = activeReplyId
    ? [root, ...replies].find((comment) => comment._id === activeReplyId)
    : undefined;

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (anchor === null) return;
    restoreCommentAnchor(repliesRef.current, anchor);
    anchorRef.current = null;
  }, [replies.length]);

  const loadMore = () => {
    anchorRef.current = captureFirstCommentAnchor(repliesRef.current);
    onLoadMore();
  };

  return (
    <div
      className="t-acc-panel"
      onTransitionEnd={(event) => {
        if (
          !expanded &&
          event.target === event.currentTarget &&
          event.propertyName === "grid-template-rows"
        ) {
          onDisclosureTransitionEnd(root._id);
        }
      }}
    >
      <div
        aria-hidden={!expanded}
        aria-label={`${root.replyCount} ${
          root.replyCount === 1 ? "reply" : "replies"
        }`}
        className="t-acc-panel-inner"
        id={`replies-${root._id}`}
        inert={!expanded}
        role="region"
      >
        <div
          className="mt-4 ml-3 flex flex-col gap-4 border-l pl-4 md:ml-5 md:pl-4"
          ref={repliesRef}
        >
          {canLoadMore ? (
            <Button
              onClick={loadMore}
              pending={loadingMore}
              size="sm"
              variant="link"
            >
              View earlier replies
            </Button>
          ) : null}
          <SkeletonReveal
            ready={!loadingFirstPage}
            skeleton={<CommentRepliesSkeleton />}
          >
            {loadingFirstPage ? null : (
              <div className="flex flex-col gap-4">
                {replies.map((reply) => (
                  <CommentItem
                    comment={reply}
                    error={commentError(reply._id)}
                    key={commentRenderKey(reply)}
                    onEditStart={onEditStart}
                    onRemove={onRemove}
                    onReply={onReply}
                    onUpdate={onUpdate}
                    pending={pendingIds.has(String(reply._id))}
                    sending={pendingIds.has(reply.clientRequestId)}
                  />
                ))}
              </div>
            )}
          </SkeletonReveal>
          {target?.capabilities.canReply && activeReplyId ? (
            <div className="pt-2">
              <p className="mb-2 text-xs text-muted-foreground">
                Replying to {target.authorNameSnapshot || "Member"}
              </p>
              <CommentComposer
                autoFocus
                error={replyError}
                initialBody={replyDraft}
                label={`Reply to ${target.authorNameSnapshot || "member"}`}
                onCancel={onCancelReply}
                onDraftChange={(body) => onDraftChange(root._id, body)}
                onSubmit={async (body) => {
                  await onPostReply(body, target);
                }}
                pending={replyPending}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
