import { describe, expect, it } from "vitest";
import type { Id } from "@pompeii/api";

import {
  chronologicalReplies,
  commentRenderKey,
  formatCommentRelativeTime,
} from "./comment-display";
import type { CommentReply } from "@/types/comments";

function reply(id: string, clientRequestId: string): CommentReply {
  return {
    _id: id as Id<"comments">,
    _creationTime: 1,
    kind: "reply",
    rootId: "root" as Id<"comments">,
    replyToId: "root" as Id<"comments">,
    replyToAuthorNameSnapshot: "Member",
    authorId: "author" as Id<"users">,
    authorNameSnapshot: "Member",
    clientRequestId,
    body: id,
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
}

describe("comment display helpers", () => {
  it("reverses newest-first replies without mutating the source", () => {
    const newestFirst = [reply("new", "new-request"), reply("old", "old-request")];
    const chronological = chronologicalReplies(newestFirst);

    expect(chronological.map((item) => item.body)).toEqual(["old", "new"]);
    expect(newestFirst.map((item) => item.body)).toEqual(["new", "old"]);
  });

  it("keeps the render key stable across optimistic reconciliation", () => {
    const optimistic = reply("temporary", "stable-request");
    const canonical = reply("server-id", "stable-request");

    expect(commentRenderKey(optimistic)).toBe(
      commentRenderKey(canonical),
    );
  });

  it("formats relative time against a deterministic clock", () => {
    expect(formatCommentRelativeTime(0, 60_000)).toContain("minute");
  });
});
