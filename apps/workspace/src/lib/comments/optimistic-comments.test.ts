import { describe, expect, it } from "vitest";
import type { OptimisticLocalStore } from "convex/browser";
import { getFunctionName, type FunctionReference } from "convex/server";
import { api } from "@pompeii/api";
import type { Id } from "@pompeii/api";

import {
  optimisticallyCreateComment,
  optimisticallyRemoveComment,
  optimisticallyUpdateComment,
} from "./optimistic-comments";
import type {
  CommentItem,
  CommentReply,
  CommentRoot,
  CommentSubject,
} from "@/types/comments";

type Entry = {
  query: FunctionReference<"query">;
  args: Record<string, unknown>;
  value: unknown;
};

function sameArgs(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function sameQuery(
  left: FunctionReference<"query">,
  right: FunctionReference<"query">,
) {
  return getFunctionName(left) === getFunctionName(right);
}

function fakeStore(entries: Entry[]) {
  const store = {
    getQuery(query: FunctionReference<"query">, args: Record<string, unknown>) {
      return entries.find(
        (entry) => sameQuery(entry.query, query) && sameArgs(entry.args, args),
      )?.value;
    },
    getAllQueries(query: FunctionReference<"query">) {
      return entries
        .filter((entry) => sameQuery(entry.query, query))
        .map((entry) => ({ args: entry.args, value: entry.value }));
    },
    setQuery(
      query: FunctionReference<"query">,
      args: Record<string, unknown>,
      value: unknown,
    ) {
      const entry = entries.find(
        (current) =>
          sameQuery(current.query, query) && sameArgs(current.args, args),
      );
      if (entry) entry.value = value;
      else entries.push({ query, args, value });
    },
  } as unknown as OptimisticLocalStore;
  const value = <Value>(
    query: FunctionReference<"query">,
    args: Record<string, unknown>,
  ) =>
    entries.find(
      (entry) => sameQuery(entry.query, query) && sameArgs(entry.args, args),
    )?.value as Value;
  return { store, value };
}

const weddingId = "wedding" as Id<"weddings">;
const subject: CommentSubject = {
  type: "task",
  taskId: "task" as Id<"tasks">,
};
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
  isCurrentUser: true,
  replyCount: 0,
  capabilities: {
    canEdit: true,
    canDelete: true,
    canReply: true,
  },
};

function page(items: CommentItem[]) {
  return { page: items, continueCursor: "", isDone: true };
}

describe("optimistic comments cache", () => {
  it("inserts roots and replies with exact optimistic counts", () => {
    const summaryArgs = { weddingId, subject };
    const rootArgs = {
      weddingId,
      subject,
      paginationOpts: { cursor: null, numItems: 20 },
    };
    const replyArgs = {
      weddingId,
      subject,
      rootId: root._id,
      paginationOpts: { cursor: null, numItems: 10 },
    };
    const { store, value } = fakeStore([
      {
        query: api.comments.summary.handler.summary,
        args: summaryArgs,
        value: {
          activeCount: 1,
          rootCount: 1,
          canPost: true,
          canReply: true,
        },
      },
      {
        query: api.comments.listRoots.handler.listRoots,
        args: rootArgs,
        value: page([root]),
      },
      {
        query: api.comments.listReplies.handler.listReplies,
        args: replyArgs,
        value: page([]),
      },
    ]);

    optimisticallyCreateComment(store, {
      weddingId,
      subject,
      body: "New root",
      clientRequestId: "new-root",
      now: 2,
    });
    optimisticallyCreateComment(store, {
      weddingId,
      subject,
      body: "New reply",
      clientRequestId: "new-reply",
      replyTo: root,
      now: 3,
    });

    expect(
      value<{ activeCount: number; rootCount: number }>(
        api.comments.summary.handler.summary,
        summaryArgs,
      ),
    ).toMatchObject({ activeCount: 3, rootCount: 2 });
    expect(
      value<{ page: CommentItem[] }>(
        api.comments.listRoots.handler.listRoots,
        rootArgs,
      ).page,
    ).toMatchObject([
      { clientRequestId: "new-root" },
      { _id: root._id, replyCount: 1 },
    ]);
    expect(
      value<{ page: CommentItem[] }>(
        api.comments.listReplies.handler.listReplies,
        replyArgs,
      ).page,
    ).toMatchObject([
      {
        clientRequestId: "new-reply",
        rootId: root._id,
        replyToId: root._id,
      },
    ]);
  });

  it("updates and removes replies without stale rows or counts", () => {
    const reply: CommentReply = {
      ...root,
      _id: "reply" as Id<"comments">,
      kind: "reply",
      rootId: root._id,
      replyToId: root._id,
      replyToAuthorNameSnapshot: "Amara",
    };
    const rootWithReply = { ...root, replyCount: 1 };
    const summaryArgs = { weddingId, subject };
    const rootArgs = {
      weddingId,
      subject,
      paginationOpts: { cursor: null, numItems: 20 },
    };
    const replyArgs = {
      weddingId,
      subject,
      rootId: root._id,
      paginationOpts: { cursor: null, numItems: 10 },
    };
    const { store, value } = fakeStore([
      {
        query: api.comments.summary.handler.summary,
        args: summaryArgs,
        value: {
          activeCount: 2,
          rootCount: 1,
          canPost: true,
          canReply: true,
        },
      },
      {
        query: api.comments.listRoots.handler.listRoots,
        args: rootArgs,
        value: page([rootWithReply]),
      },
      {
        query: api.comments.listReplies.handler.listReplies,
        args: replyArgs,
        value: page([reply]),
      },
    ]);

    optimisticallyUpdateComment(store, {
      weddingId,
      subject,
      commentId: reply._id,
      body: "Edited reply",
      now: 3,
    });
    expect(
      value<{ page: CommentReply[] }>(
        api.comments.listReplies.handler.listReplies,
        replyArgs,
      ).page[0],
    ).toMatchObject({ body: "Edited reply", editedAt: 3 });

    optimisticallyRemoveComment(store, {
      weddingId,
      subject,
      comment: reply,
      now: 4,
    });
    expect(
      value<{ page: CommentReply[] }>(
        api.comments.listReplies.handler.listReplies,
        replyArgs,
      ).page,
    ).toEqual([]);
    expect(
      value<{ page: CommentRoot[] }>(
        api.comments.listRoots.handler.listRoots,
        rootArgs,
      ).page[0]?.replyCount,
    ).toBe(0);
    expect(
      value<{ activeCount: number; rootCount: number }>(
        api.comments.summary.handler.summary,
        summaryArgs,
      ),
    ).toMatchObject({ activeCount: 1, rootCount: 1 });
  });

  it("tombstones roots with replies and hides empty roots", () => {
    const summaryArgs = { weddingId, subject };
    const rootArgs = {
      weddingId,
      subject,
      paginationOpts: { cursor: null, numItems: 20 },
    };
    const replyArgs = {
      weddingId,
      subject,
      rootId: root._id,
      paginationOpts: { cursor: null, numItems: 10 },
    };
    const withReply = { ...root, replyCount: 1 };
    const visibleReply: CommentReply = {
      ...root,
      _id: "visible-reply" as Id<"comments">,
      kind: "reply",
      rootId: root._id,
      replyToId: root._id,
      replyToAuthorNameSnapshot: "Amara",
    };
    const { store, value } = fakeStore([
      {
        query: api.comments.summary.handler.summary,
        args: summaryArgs,
        value: {
          activeCount: 2,
          rootCount: 1,
          canPost: true,
          canReply: true,
        },
      },
      {
        query: api.comments.listRoots.handler.listRoots,
        args: rootArgs,
        value: page([withReply]),
      },
      {
        query: api.comments.listReplies.handler.listReplies,
        args: replyArgs,
        value: page([visibleReply]),
      },
    ]);

    optimisticallyRemoveComment(store, {
      weddingId,
      subject,
      comment: withReply,
      now: 5,
    });
    expect(
      value<{ page: CommentRoot[] }>(
        api.comments.listRoots.handler.listRoots,
        rootArgs,
      ).page[0],
    ).toMatchObject({
      body: "",
      deletedAt: 5,
      isDeleted: true,
      replyCount: 1,
    });
    expect(
      value<{ page: CommentReply[] }>(
        api.comments.listReplies.handler.listReplies,
        replyArgs,
      ).page[0]?.capabilities.canReply,
    ).toBe(false);

    const emptyStore = fakeStore([
      {
        query: api.comments.summary.handler.summary,
        args: summaryArgs,
        value: {
          activeCount: 1,
          rootCount: 1,
          canPost: true,
          canReply: true,
        },
      },
      {
        query: api.comments.listRoots.handler.listRoots,
        args: rootArgs,
        value: page([root]),
      },
    ]);
    optimisticallyRemoveComment(emptyStore.store, {
      weddingId,
      subject,
      comment: root,
      now: 6,
    });
    expect(
      emptyStore.value<{ page: CommentRoot[] }>(
        api.comments.listRoots.handler.listRoots,
        rootArgs,
      ).page,
    ).toEqual([]);
  });
});
