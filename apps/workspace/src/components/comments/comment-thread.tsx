import { memo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";

import { ArrowDownIcon, ArrowUpIcon } from "@/components/icons/arrow";
import { CommentItem } from "@/components/comments/comment-item";
import { CommentReplies } from "@/components/comments/comment-replies";
import { TextSwap } from "@/components/ui/text-swap";
import type {
  CommentItem as CommentItemData,
  CommentReply,
  CommentRoot,
} from "@/types/comments";
import type { Id } from "@pompeii/api";

export const CommentThread = memo(function CommentThread({
  root,
  expanded,
  replies,
  loadingFirstPage,
  loadingMore,
  replyError,
  replyDraft,
  activeReplyId,
  onToggle,
  onReply,
  onCancelReply,
  onDraftChange,
  onDisclosureTransitionEnd,
  onEditStart,
  onUpdate,
  onPostReply,
  onRemove,
  onLoadMore,
  canLoadMore,
  pendingIds,
  replyPending,
  commentError,
  rootError,
  rootPending,
  rootSending,
}: {
  root: CommentRoot;
  expanded: boolean;
  replies: CommentReply[];
  loadingFirstPage: boolean;
  loadingMore: boolean;
  replyError?: string | null;
  replyDraft: string;
  activeReplyId: Id<"comments"> | null;
  onToggle: (rootId: Id<"comments">) => void;
  onReply: (
    comment: CommentRoot | CommentReply,
    trigger: HTMLButtonElement,
  ) => void;
  onCancelReply: () => void;
  onDraftChange: (rootId: Id<"comments">, body: string) => void;
  onDisclosureTransitionEnd: (rootId: Id<"comments">) => void;
  onEditStart: () => void;
  onUpdate: (
    comment: CommentRoot | CommentReply,
    body: string,
  ) => Promise<void>;
  onPostReply: (body: string, replyTo: CommentItemData) => Promise<void>;
  onRemove: (
    comment: CommentRoot | CommentReply,
    trigger: HTMLButtonElement | null,
  ) => void;
  onLoadMore: () => void;
  canLoadMore: boolean;
  pendingIds: ReadonlySet<string>;
  replyPending: boolean;
  commentError: (commentId: Id<"comments">) => string | null;
  rootError?: string | null;
  rootPending: boolean;
  rootSending: boolean;
}) {
  return (
    <div className="t-acc border-b py-5 last:border-b-0" data-open={expanded}>
      <CommentItem
        comment={root}
        error={rootError}
        onEditStart={onEditStart}
        onRemove={onRemove}
        onReply={onReply}
        onUpdate={onUpdate}
        pending={rootPending}
        sending={rootSending}
      />
      {root.replyCount > 0 ? (
        <button
          aria-controls={`replies-${root._id}`}
          aria-expanded={expanded}
          className="t-acc-head mt-3 ml-11 inline-flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => onToggle(root._id)}
          type="button"
        >
          <span
            className="t-acc-chevron t-icon-swap"
            data-state={expanded ? "b" : "a"}
          >
            <span className="t-icon" data-icon="a">
              <HugeiconsIcon
                className="size-3"
                icon={ArrowDownIcon}
                strokeWidth={1.5}
              />
            </span>
            <span className="t-icon" data-icon="b">
              <HugeiconsIcon
                className="size-3"
                icon={ArrowUpIcon}
                strokeWidth={1.5}
              />
            </span>
          </span>
          <TextSwap>
            {expanded
              ? "Hide replies"
              : `View ${root.replyCount} ${
                  root.replyCount === 1 ? "reply" : "replies"
                }`}
          </TextSwap>
        </button>
      ) : null}
      <CommentReplies
        activeReplyId={activeReplyId}
        canLoadMore={canLoadMore}
        commentError={commentError}
        expanded={expanded}
        loadingFirstPage={loadingFirstPage}
        loadingMore={loadingMore}
        onCancelReply={onCancelReply}
        onDisclosureTransitionEnd={onDisclosureTransitionEnd}
        onDraftChange={onDraftChange}
        onEditStart={onEditStart}
        onLoadMore={onLoadMore}
        onPostReply={onPostReply}
        onRemove={onRemove}
        onReply={onReply}
        onUpdate={onUpdate}
        pendingIds={pendingIds}
        replies={replies}
        replyDraft={replyDraft}
        replyError={replyError}
        replyPending={replyPending}
        root={root}
      />
    </div>
  );
});
