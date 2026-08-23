import { memo, useRef, useState } from "react";

import { CommentActions } from "@/components/comments/comment-actions";
import { CommentComposer } from "@/components/comments/comment-composer";
import { CommentTombstone } from "@/components/comments/comment-tombstone";
import { MemberAvatar } from "@/components/shared/member-avatar";
import { TextSwap } from "@/components/ui/text-swap";
import {
  formatCommentAbsoluteTime,
  formatCommentRelativeTime,
} from "@/lib/comments/comment-display";
import type { CommentItem as CommentItemData } from "@/types/comments";

export const CommentItem = memo(function CommentItem({
  comment,
  error,
  pending,
  sending,
  onEditStart,
  onUpdate,
  onRemove,
  onReply,
}: {
  comment: CommentItemData;
  error?: string | null;
  pending: boolean;
  sending: boolean;
  onEditStart?: () => void;
  onUpdate?: (comment: CommentItemData, body: string) => Promise<void>;
  onRemove?: (
    comment: CommentItemData,
    trigger: HTMLButtonElement | null,
  ) => void;
  onReply?: (comment: CommentItemData, trigger: HTMLButtonElement) => void;
}) {
  const [editing, setEditing] = useState(false);
  const articleRef = useRef<HTMLElement>(null);
  const restoreActionFocus = () => {
    requestAnimationFrame(() => {
      articleRef.current
        ?.querySelector<HTMLButtonElement>('[aria-label="Comment actions"]')
        ?.focus();
    });
  };
  return (
    <article
      aria-label={`Comment by ${comment.authorNameSnapshot || "Member"}`}
      className="flex gap-3"
      data-comment-id={comment._id}
      ref={articleRef}
    >
      <MemberAvatar
        className={comment.kind === "reply" ? "size-7" : "size-8"}
        label={`Comment by ${comment.authorNameSnapshot}`}
        name={comment.authorNameSnapshot}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {comment.authorNameSnapshot || "Member"}
          </span>
          <time
            aria-live="polite"
            className="text-xs text-muted-foreground"
            dateTime={new Date(comment._creationTime).toISOString()}
            title={
              sending
                ? undefined
                : formatCommentAbsoluteTime(comment._creationTime)
            }
          >
            <TextSwap>
              {sending
                ? "Sending..."
                : formatCommentRelativeTime(comment._creationTime)}
            </TextSwap>
          </time>
          {comment.editedAt !== null ? (
            <span className="text-xs text-muted-foreground">(edited)</span>
          ) : null}
          {!pending &&
          !editing &&
          (comment.capabilities.canEdit || comment.capabilities.canDelete) ? (
            <CommentActions
              comment={comment}
              onEdit={
                onUpdate
                  ? () => {
                      onEditStart?.();
                      setEditing(true);
                    }
                  : undefined
              }
              onRemove={
                onRemove
                  ? () =>
                      onRemove(
                        comment,
                        articleRef.current?.querySelector<HTMLButtonElement>(
                          '[aria-label="Comment actions"]',
                        ) ?? null,
                      )
                  : undefined
              }
            />
          ) : null}
        </div>
        {editing ? (
          <div className="mt-3">
            <CommentComposer
              autoFocus
              error={error}
              initialBody={comment.body}
              label="Edit comment"
              onCancel={() => {
                setEditing(false);
                restoreActionFocus();
              }}
              onSubmit={async (body) => {
                await onUpdate?.(comment, body);
                setEditing(false);
                restoreActionFocus();
              }}
              pending={pending}
              submitLabel="Save changes"
            />
          </div>
        ) : comment.isDeleted ? (
          <CommentTombstone />
        ) : (
          <>
            {comment.kind === "reply" && comment.replyToAuthorNameSnapshot ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Replying to {comment.replyToAuthorNameSnapshot}
              </p>
            ) : null}
            <p className="mt-1 whitespace-pre-wrap wrap-break-word text-sm leading-6">
              {comment.body}
            </p>
          </>
        )}
        {!pending && !editing && comment.capabilities.canReply && onReply ? (
          <button
            className="mt-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground"
            onClick={(event) => onReply(comment, event.currentTarget)}
            type="button"
          >
            Reply
          </button>
        ) : null}
      </div>
    </article>
  );
});
