import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Id } from "@pompeii/api";

import { CommentEmptyState } from "./comment-empty-state";
import { CommentItem } from "./comment-item";
import type { CommentReply, CommentRoot } from "@/types/comments";

const root: CommentRoot = {
  _id: "root" as Id<"comments">,
  _creationTime: 1,
  kind: "root",
  authorId: "author" as Id<"users">,
  authorNameSnapshot: "Amara",
  clientRequestId: "root-request",
  body: "Root comment",
  editedAt: null,
  deletedAt: null,
  isDeleted: false,
  isCurrentUser: true,
  replyCount: 1,
  capabilities: {
    canEdit: true,
    canDelete: true,
    canReply: true,
  },
};

describe("CommentItem", () => {
  it("renders the empty conversation state", () => {
    expect(renderToStaticMarkup(<CommentEmptyState />)).toContain(
      "No comments yet.",
    );
  });

  it("renders a root and its sending state", () => {
    const markup = renderToStaticMarkup(
      <CommentItem
        comment={root}
        onReply={() => undefined}
        pending={false}
        sending
      />,
    );

    expect(markup).toContain("Amara");
    expect(markup).toContain("Root comment");
    expect(markup).toContain("Sending...");
    expect(markup).toContain("Reply");
  });

  it("renders flattened reply target context", () => {
    const reply: CommentReply = {
      ...root,
      _id: "reply" as Id<"comments">,
      kind: "reply",
      rootId: root._id,
      replyToId: root._id,
      replyToAuthorNameSnapshot: "Amara",
    };
    const markup = renderToStaticMarkup(
      <CommentItem comment={reply} pending={false} sending={false} />,
    );

    expect(markup).toContain("Replying to Amara");
  });

  it("renders edited and tombstone states", () => {
    const edited = renderToStaticMarkup(
      <CommentItem
        comment={{ ...root, editedAt: 2 }}
        pending={false}
        sending={false}
      />,
    );
    const tombstone = renderToStaticMarkup(
      <CommentItem
        comment={{
          ...root,
          body: "",
          deletedAt: 2,
          isDeleted: true,
          capabilities: {
            canEdit: false,
            canDelete: false,
            canReply: false,
          },
        }}
        pending={false}
        sending={false}
      />,
    );

    expect(edited).toContain("(edited)");
    expect(tombstone).toContain("Comment deleted.");
  });
});
