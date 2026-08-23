import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Id } from "@pompeii/api";

import { CommentThread } from "./comment-thread";
import type { CommentReply, CommentRoot } from "@/types/comments";

const root: CommentRoot = {
  _id: "root" as Id<"comments">,
  _creationTime: 1,
  kind: "root",
  authorId: "author" as Id<"users">,
  authorNameSnapshot: "Amara",
  clientRequestId: "root-request",
  body: "Root",
  editedAt: null,
  deletedAt: null,
  isDeleted: false,
  isCurrentUser: false,
  replyCount: 1,
  capabilities: {
    canEdit: false,
    canDelete: false,
    canReply: true,
  },
};
const reply: CommentReply = {
  _id: "reply" as Id<"comments">,
  _creationTime: 2,
  kind: "reply",
  rootId: root._id,
  replyToId: root._id,
  replyToAuthorNameSnapshot: "Amara",
  authorId: "reply-author" as Id<"users">,
  authorNameSnapshot: "Tomi",
  clientRequestId: "reply-request",
  body: "Reply",
  editedAt: null,
  deletedAt: null,
  isDeleted: false,
  isCurrentUser: false,
  capabilities: {
    canEdit: false,
    canDelete: false,
    canReply: true,
  },
};

describe("CommentThread", () => {
  it("renders an expanded single-rail thread", () => {
    const markup = renderToStaticMarkup(
      <CommentThread
        activeReplyId={null}
        canLoadMore
        commentError={() => null}
        expanded
        loadingFirstPage={false}
        loadingMore={false}
        onCancelReply={() => undefined}
        onDisclosureTransitionEnd={() => undefined}
        onDraftChange={() => undefined}
        onEditStart={() => undefined}
        onLoadMore={() => undefined}
        onPostReply={async () => undefined}
        onRemove={() => undefined}
        onReply={() => undefined}
        onToggle={() => undefined}
        onUpdate={async () => undefined}
        pendingIds={new Set()}
        replies={[reply]}
        replyDraft=""
        replyPending={false}
        root={root}
        rootPending={false}
        rootSending={false}
      />,
    );

    expect(markup).toContain('data-open="true"');
    expect(markup).toContain('aria-expanded="true"');
    expect(markup).toContain("Hide replies");
    expect(markup).toContain("View earlier replies");
    expect(markup).toContain("Replying to Amara");
    expect(markup).toContain("ml-3");
    expect(markup).toContain("md:ml-5");
  });
});
