import { describe, expect, it } from "vitest";

import { parseClientError } from "@pompeii/errors";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { makeConvexTest, signIn } from "../test.setup";

async function createWedding(asUser: Awaited<ReturnType<typeof signIn>>) {
  await asUser.mutation(api.weddings.saveDraft.handler.saveDraft, {
    step: 1,
    name: "Amara & Tomi",
  });
  await asUser.mutation(api.weddings.saveDraft.handler.saveDraft, {
    step: 2,
    coupleA: "Amara",
    coupleB: "Tomi",
  });
  return asUser.mutation(api.weddings.create.handler.create, {});
}

async function weddingBySlug(
  t: ReturnType<typeof makeConvexTest>,
  slug: string,
) {
  return t.run(async (ctx) =>
    ctx.db
      .query("weddings")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique(),
  );
}

async function addMember(
  t: ReturnType<typeof makeConvexTest>,
  weddingId: Id<"weddings">,
  email: string,
) {
  const asMember = await signIn(t, email);
  const user = await t.run(async (ctx) =>
    ctx.db.query("users").order("desc").first(),
  );
  if (user === null) {
    throw new Error("Expected a user");
  }
  await t.run((ctx) =>
    ctx.db.insert("weddingMembers", {
      weddingId,
      userId: user._id,
      displayName: email,
      role: "planner",
    }),
  );
  return asMember;
}

describe("comments", () => {
  it("creates a root, reply, and reply to a reply", async () => {
    const t = makeConvexTest();
    const member = await signIn(t, "member@example.com");
    await createWedding(member);
    const wedding = await t.run(
      async (ctx) => (await ctx.db.query("weddings").unique())!,
    );
    const task = await member.mutation(api.tasks.create.handler.create, {
      weddingId: wedding._id,
      title: "Confirm the menu",
    });
    const subject = { type: "task" as const, taskId: task._id };

    const root = await member.mutation(api.comments.create.handler.create, {
      weddingId: wedding._id,
      subject,
      body: "We should confirm this.",
      clientRequestId: "root-1",
    });
    const reply = await member.mutation(api.comments.create.handler.create, {
      weddingId: wedding._id,
      subject,
      body: "I will call them.",
      clientRequestId: "reply-1",
      replyToId: root._id,
    });
    const nestedReply = await member.mutation(
      api.comments.create.handler.create,
      {
        weddingId: wedding._id,
        subject,
        body: "Thank you.",
        clientRequestId: "reply-2",
        replyToId: reply._id,
      },
    );

    expect(root.kind).toBe("root");
    expect(reply.kind).toBe("reply");
    expect(nestedReply.kind).toBe("reply");
    if (reply.kind === "reply" && nestedReply.kind === "reply") {
      expect(nestedReply.rootId).toBe(reply.rootId);
      expect(nestedReply.replyToId).toBe(reply._id);
    }

    await expect(
      member.query(api.comments.summary.handler.summary, {
        subject,
        weddingId: wedding._id,
      }),
    ).resolves.toMatchObject({ activeCount: 3, rootCount: 1 });
  });

  it("shares a thread between members without sharing author controls", async () => {
    const t = makeConvexTest();
    const owner = await signIn(t, "owner@example.com");
    await createWedding(owner);
    const wedding = await t.run(
      async (ctx) => (await ctx.db.query("weddings").unique())!,
    );
    const planner = await addMember(t, wedding._id, "planner@example.com");
    const task = await owner.mutation(api.tasks.create.handler.create, {
      weddingId: wedding._id,
      title: "Confirm the menu",
    });
    const subject = { type: "task" as const, taskId: task._id };
    const root = await owner.mutation(api.comments.create.handler.create, {
      weddingId: wedding._id,
      subject,
      body: "Can you confirm this?",
      clientRequestId: "owner-root",
    });

    const plannerRoots = await planner.query(
      api.comments.listRoots.handler.listRoots,
      {
        weddingId: wedding._id,
        subject,
        paginationOpts: { numItems: 20, cursor: null },
      },
    );
    expect(plannerRoots.page).toMatchObject([
      {
        _id: root._id,
        isCurrentUser: false,
        capabilities: {
          canEdit: false,
          canDelete: false,
          canReply: true,
        },
      },
    ]);

    const reply = await planner.mutation(api.comments.create.handler.create, {
      weddingId: wedding._id,
      subject,
      body: "I will handle it.",
      clientRequestId: "planner-reply",
      replyToId: root._id,
    });
    const ownerReplies = await owner.query(
      api.comments.listReplies.handler.listReplies,
      {
        weddingId: wedding._id,
        subject,
        rootId: root._id,
        paginationOpts: { numItems: 10, cursor: null },
      },
    );
    expect(ownerReplies.page).toMatchObject([
      {
        _id: reply._id,
        isCurrentUser: false,
        authorNameSnapshot: "planner@example.com",
      },
    ]);
  });

  it("does not duplicate an idempotent create", async () => {
    const t = makeConvexTest();
    const member = await signIn(t, "member@example.com");
    await createWedding(member);
    const wedding = await t.run(
      async (ctx) => (await ctx.db.query("weddings").unique())!,
    );
    const task = await member.mutation(api.tasks.create.handler.create, {
      weddingId: wedding._id,
      title: "Confirm the menu",
    });
    const args = {
      weddingId: wedding._id,
      subject: { type: "task" as const, taskId: task._id },
      body: "One comment only.",
      clientRequestId: "same-request",
    };
    const first = await member.mutation(
      api.comments.create.handler.create,
      args,
    );
    const second = await member.mutation(
      api.comments.create.handler.create,
      args,
    );

    expect(second._id).toBe(first._id);
    await expect(
      member.query(api.comments.summary.handler.summary, {
        weddingId: wedding._id,
        subject: args.subject,
      }),
    ).resolves.toMatchObject({ activeCount: 1, rootCount: 1 });
  });

  it("rejects conflicting reuse of a client request ID", async () => {
    const t = makeConvexTest();
    const member = await signIn(t, "member@example.com");
    await createWedding(member);
    const wedding = await t.run(
      async (ctx) => (await ctx.db.query("weddings").unique())!,
    );
    const task = await member.mutation(api.tasks.create.handler.create, {
      weddingId: wedding._id,
      title: "Confirm the menu",
    });
    const subject = { type: "task" as const, taskId: task._id };
    const args = {
      weddingId: wedding._id,
      subject,
      body: "Original",
      clientRequestId: "conflict-request",
    };
    await member.mutation(api.comments.create.handler.create, args);

    await expect(
      member.mutation(api.comments.create.handler.create, {
        ...args,
        body: "Changed",
      }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        parseClientError(error)?.code === "COMMENTS_IDEMPOTENCY_CONFLICT",
    );
  });

  it("rejects unauthenticated reads and deleted subjects", async () => {
    const t = makeConvexTest();
    const member = await signIn(t, "member@example.com");
    await createWedding(member);
    const wedding = await t.run(
      async (ctx) => (await ctx.db.query("weddings").unique())!,
    );
    const task = await member.mutation(api.tasks.create.handler.create, {
      weddingId: wedding._id,
      title: "A task",
    });
    await expect(
      t.query(api.comments.summary.handler.summary, {
        weddingId: wedding._id,
        subject: { type: "task", taskId: task._id },
      }),
    ).rejects.toSatisfy(
      (error: unknown) => parseClientError(error)?.code === "UNAUTHENTICATED",
    );
    await member.mutation(api.tasks.delete.handler.deleteTask, {
      weddingId: wedding._id,
      taskId: task._id,
    });
    await expect(
      member.query(api.comments.summary.handler.summary, {
        weddingId: wedding._id,
        subject: { type: "task", taskId: task._id },
      }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        parseClientError(error)?.code === "COMMENTS_SUBJECT_NOT_FOUND",
    );
  });

  it("keeps a root tombstone while replies remain and blocks new replies", async () => {
    const t = makeConvexTest();
    const member = await signIn(t, "member@example.com");
    await createWedding(member);
    const wedding = await t.run(
      async (ctx) => (await ctx.db.query("weddings").unique())!,
    );
    const task = await member.mutation(api.tasks.create.handler.create, {
      weddingId: wedding._id,
      title: "Confirm the menu",
    });
    const subject = { type: "task" as const, taskId: task._id };
    const root = await member.mutation(api.comments.create.handler.create, {
      weddingId: wedding._id,
      subject,
      body: "Root",
      clientRequestId: "root",
    });
    const reply = await member.mutation(api.comments.create.handler.create, {
      weddingId: wedding._id,
      subject,
      body: "Reply",
      clientRequestId: "reply",
      replyToId: root._id,
    });

    await member.mutation(api.comments.remove.handler.remove, {
      weddingId: wedding._id,
      commentId: root._id,
    });
    const roots = await member.query(api.comments.listRoots.handler.listRoots, {
      weddingId: wedding._id,
      subject,
      paginationOpts: { numItems: 20, cursor: null },
    });
    expect(roots.page).toMatchObject([
      { isDeleted: true, replyCount: 1, body: "" },
    ]);
    const replies = await member.query(
      api.comments.listReplies.handler.listReplies,
      {
        weddingId: wedding._id,
        subject,
        rootId: root._id,
        paginationOpts: { numItems: 10, cursor: null },
      },
    );
    expect(replies.page).toMatchObject([
      {
        _id: reply._id,
        capabilities: { canReply: false },
      },
    ]);
    await expect(
      member.mutation(api.comments.create.handler.create, {
        weddingId: wedding._id,
        subject,
        body: "Another reply",
        clientRequestId: "reply-after-delete",
        replyToId: root._id,
      }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        parseClientError(error)?.code === "COMMENTS_REPLY_TARGET_DELETED",
    );
    await expect(
      member.query(api.comments.summary.handler.summary, {
        weddingId: wedding._id,
        subject,
      }),
    ).resolves.toMatchObject({ activeCount: 1, rootCount: 0 });
  });

  it("removes a reply exactly once and hides an empty tombstoned root", async () => {
    const t = makeConvexTest();
    const member = await signIn(t, "member@example.com");
    await createWedding(member);
    const wedding = await t.run(
      async (ctx) => (await ctx.db.query("weddings").unique())!,
    );
    const task = await member.mutation(api.tasks.create.handler.create, {
      weddingId: wedding._id,
      title: "Confirm the menu",
    });
    const subject = { type: "task" as const, taskId: task._id };
    const root = await member.mutation(api.comments.create.handler.create, {
      weddingId: wedding._id,
      subject,
      body: "Root",
      clientRequestId: "remove-root",
    });
    const reply = await member.mutation(api.comments.create.handler.create, {
      weddingId: wedding._id,
      subject,
      body: "Reply",
      clientRequestId: "remove-reply",
      replyToId: root._id,
    });
    await member.mutation(api.comments.remove.handler.remove, {
      weddingId: wedding._id,
      commentId: root._id,
    });
    await member.mutation(api.comments.remove.handler.remove, {
      weddingId: wedding._id,
      commentId: reply._id,
    });
    await member.mutation(api.comments.remove.handler.remove, {
      weddingId: wedding._id,
      commentId: reply._id,
    });

    await expect(
      member.query(api.comments.summary.handler.summary, {
        weddingId: wedding._id,
        subject,
      }),
    ).resolves.toMatchObject({ activeCount: 0, rootCount: 0 });
    await expect(
      member.query(api.comments.listRoots.handler.listRoots, {
        weddingId: wedding._id,
        subject,
        paginationOpts: { numItems: 20, cursor: null },
      }),
    ).resolves.toMatchObject({ page: [] });
  });

  it("paginates roots and replies independently", async () => {
    const t = makeConvexTest();
    const member = await signIn(t, "member@example.com");
    await createWedding(member);
    const wedding = await t.run(
      async (ctx) => (await ctx.db.query("weddings").unique())!,
    );
    const task = await member.mutation(api.tasks.create.handler.create, {
      weddingId: wedding._id,
      title: "Confirm the menu",
    });
    const subject = { type: "task" as const, taskId: task._id };
    const root = await member.mutation(api.comments.create.handler.create, {
      weddingId: wedding._id,
      subject,
      body: "Root",
      clientRequestId: "root",
    });
    await member.mutation(api.comments.create.handler.create, {
      weddingId: wedding._id,
      subject,
      body: "Reply",
      clientRequestId: "reply",
      replyToId: root._id,
    });

    const rootPage = await member.query(
      api.comments.listRoots.handler.listRoots,
      {
        weddingId: wedding._id,
        subject,
        paginationOpts: { numItems: 1, cursor: null },
      },
    );
    const replyPage = await member.query(
      api.comments.listReplies.handler.listReplies,
      {
        weddingId: wedding._id,
        subject,
        rootId: root._id,
        paginationOpts: { numItems: 1, cursor: null },
      },
    );
    expect(rootPage.page).toHaveLength(1);
    expect(replyPage.page).toMatchObject([{ kind: "reply", body: "Reply" }]);
  });

  it("rejects outsiders before returning workspace data", async () => {
    const t = makeConvexTest();
    const owner = await signIn(t, "owner@example.com");
    const { slug } = await createWedding(owner);
    const wedding = await weddingBySlug(t, slug);
    if (wedding === null) throw new Error("Expected a wedding");
    const task = await owner.mutation(api.tasks.create.handler.create, {
      weddingId: wedding._id,
      title: "Private task",
    });
    const outsider = await signIn(t, "outsider@example.com");
    const subject = { type: "task" as const, taskId: task._id };

    await expect(
      outsider.query(api.comments.listRoots.handler.listRoots, {
        weddingId: wedding._id,
        subject,
        paginationOpts: { numItems: 20, cursor: null },
      }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        parseClientError(error)?.code === "WEDDINGS_ENTER_NOT_FOUND",
    );
    await expect(
      outsider.mutation(api.comments.create.handler.create, {
        weddingId: wedding._id,
        subject,
        body: "I should not be able to post.",
        clientRequestId: "outsider-post",
      }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        parseClientError(error)?.code === "WEDDINGS_ENTER_NOT_FOUND",
    );
  });

  it("allows completed-task comments and rejects cross-wedding subjects", async () => {
    const t = makeConvexTest();
    const owner = await signIn(t, "owner@example.com");
    const { slug } = await createWedding(owner);
    const wedding = await weddingBySlug(t, slug);
    if (wedding === null) throw new Error("Expected a wedding");
    const completedTask = await owner.mutation(
      api.tasks.create.handler.create,
      { weddingId: wedding._id, title: "Completed task" },
    );
    await owner.mutation(api.tasks.start.handler.start, {
      weddingId: wedding._id,
      taskId: completedTask._id,
    });
    await owner.mutation(api.tasks.complete.handler.complete, {
      weddingId: wedding._id,
      taskId: completedTask._id,
    });
    await expect(
      owner.mutation(api.comments.create.handler.create, {
        weddingId: wedding._id,
        subject: { type: "task", taskId: completedTask._id },
        body: "Comments stay open.",
        clientRequestId: "completed-comment",
      }),
    ).resolves.toMatchObject({ kind: "root", body: "Comments stay open." });

    const other = await signIn(t, "other-owner@example.com");
    const { slug: otherSlug } = await createWedding(other);
    const otherWedding = await weddingBySlug(t, otherSlug);
    if (otherWedding === null) throw new Error("Expected another wedding");
    const otherTask = await other.mutation(api.tasks.create.handler.create, {
      weddingId: otherWedding._id,
      title: "Other wedding task",
    });
    await expect(
      owner.query(api.comments.summary.handler.summary, {
        weddingId: wedding._id,
        subject: { type: "task", taskId: otherTask._id },
      }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        parseClientError(error)?.code === "COMMENTS_SUBJECT_NOT_FOUND",
    );
  });

  it("rejects cross-subject root and reply injection", async () => {
    const t = makeConvexTest();
    const owner = await signIn(t, "owner@example.com");
    const { slug } = await createWedding(owner);
    const wedding = await weddingBySlug(t, slug);
    if (wedding === null) throw new Error("Expected a wedding");
    const firstTask = await owner.mutation(api.tasks.create.handler.create, {
      weddingId: wedding._id,
      title: "First task",
    });
    const secondTask = await owner.mutation(api.tasks.create.handler.create, {
      weddingId: wedding._id,
      title: "Second task",
    });
    const firstSubject = { type: "task" as const, taskId: firstTask._id };
    const secondSubject = { type: "task" as const, taskId: secondTask._id };
    const firstRoot = await owner.mutation(api.comments.create.handler.create, {
      weddingId: wedding._id,
      subject: firstSubject,
      body: "First root",
      clientRequestId: "first-root",
    });
    await owner.mutation(api.comments.create.handler.create, {
      weddingId: wedding._id,
      subject: secondSubject,
      body: "Second root",
      clientRequestId: "second-root",
    });

    await expect(
      owner.query(api.comments.listReplies.handler.listReplies, {
        weddingId: wedding._id,
        subject: secondSubject,
        rootId: firstRoot._id,
        paginationOpts: { numItems: 10, cursor: null },
      }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        parseClientError(error)?.code === "COMMENTS_REPLY_TARGET_NOT_FOUND",
    );
    await expect(
      owner.mutation(api.comments.create.handler.create, {
        weddingId: wedding._id,
        subject: secondSubject,
        body: "Injected reply",
        clientRequestId: "injected-reply",
        replyToId: firstRoot._id,
      }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        parseClientError(error)?.code === "COMMENTS_REPLY_TARGET_NOT_FOUND",
    );
  });

  it("enforces author-only edit and removal", async () => {
    const t = makeConvexTest();
    const owner = await signIn(t, "owner@example.com");
    const { slug } = await createWedding(owner);
    const wedding = await weddingBySlug(t, slug);
    if (wedding === null) throw new Error("Expected a wedding");
    const task = await owner.mutation(api.tasks.create.handler.create, {
      weddingId: wedding._id,
      title: "Shared task",
    });
    const subject = { type: "task" as const, taskId: task._id };
    const root = await owner.mutation(api.comments.create.handler.create, {
      weddingId: wedding._id,
      subject,
      body: "Owner comment",
      clientRequestId: "owner-comment",
    });
    const member = await addMember(t, wedding._id, "planner@example.com");

    await expect(
      member.mutation(api.comments.update.handler.update, {
        weddingId: wedding._id,
        commentId: root._id,
        body: "Changed by someone else",
      }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        parseClientError(error)?.code === "COMMENTS_NOT_AUTHORIZED",
    );
    await expect(
      member.mutation(api.comments.remove.handler.remove, {
        weddingId: wedding._id,
        commentId: root._id,
      }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        parseClientError(error)?.code === "COMMENTS_NOT_AUTHORIZED",
    );
    await expect(
      owner.mutation(api.comments.update.handler.update, {
        weddingId: wedding._id,
        commentId: root._id,
        body: "Edited by owner",
      }),
    ).resolves.toMatchObject({
      body: "Edited by owner",
      editedAt: expect.any(Number),
    });
  });

  it("validates comment bodies and client request IDs", async () => {
    const t = makeConvexTest();
    const owner = await signIn(t, "owner@example.com");
    const { slug } = await createWedding(owner);
    const wedding = await weddingBySlug(t, slug);
    if (wedding === null) throw new Error("Expected a wedding");
    const task = await owner.mutation(api.tasks.create.handler.create, {
      weddingId: wedding._id,
      title: "Validation task",
    });
    const subject = { type: "task" as const, taskId: task._id };
    const create = (body: string, clientRequestId: string) =>
      owner.mutation(api.comments.create.handler.create, {
        weddingId: wedding._id,
        subject,
        body,
        clientRequestId,
      });

    await expect(create("   ", "empty-body")).rejects.toSatisfy(
      (error: unknown) =>
        parseClientError(error)?.code === "COMMENTS_BODY_REQUIRED",
    );
    await expect(create("a".repeat(5001), "long-body")).rejects.toSatisfy(
      (error: unknown) =>
        parseClientError(error)?.code === "COMMENTS_BODY_TOO_LONG",
    );
    await expect(create("Valid body", "")).rejects.toSatisfy(
      (error: unknown) =>
        parseClientError(error)?.code === "COMMENTS_CLIENT_REQUEST_ID_INVALID",
    );
    await expect(create("Valid body", "a".repeat(65))).rejects.toSatisfy(
      (error: unknown) =>
        parseClientError(error)?.code === "COMMENTS_CLIENT_REQUEST_ID_INVALID",
    );
  });

  it("enforces post and edit rate limits", async () => {
    const t = makeConvexTest();
    const owner = await signIn(t, "owner@example.com");
    const { slug } = await createWedding(owner);
    const wedding = await weddingBySlug(t, slug);
    if (wedding === null) throw new Error("Expected a wedding");
    const task = await owner.mutation(api.tasks.create.handler.create, {
      weddingId: wedding._id,
      title: "Rate limited task",
    });
    const subject = { type: "task" as const, taskId: task._id };
    const roots = [];
    for (let index = 0; index < 4; index += 1) {
      roots.push(
        await owner.mutation(api.comments.create.handler.create, {
          weddingId: wedding._id,
          subject,
          body: `Comment ${index}`,
          clientRequestId: `rate-post-${index}`,
        }),
      );
    }
    await expect(
      owner.mutation(api.comments.create.handler.create, {
        weddingId: wedding._id,
        subject,
        body: "One too many",
        clientRequestId: "rate-post-blocked",
      }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        parseClientError(error)?.code === "COMMENTS_RATE_LIMITED",
    );

    for (let index = 0; index < 10; index += 1) {
      await owner.mutation(api.comments.update.handler.update, {
        weddingId: wedding._id,
        commentId: roots[0]!._id,
        body: `Edit ${index}`,
      });
    }
    await expect(
      owner.mutation(api.comments.update.handler.update, {
        weddingId: wedding._id,
        commentId: roots[0]!._id,
        body: "One edit too many",
      }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        parseClientError(error)?.code === "COMMENTS_RATE_LIMITED",
    );
  });

  it("keeps concurrent first writes and duplicate retries consistent", async () => {
    const t = makeConvexTest();
    const owner = await signIn(t, "owner@example.com");
    const { slug } = await createWedding(owner);
    const wedding = await weddingBySlug(t, slug);
    if (wedding === null) throw new Error("Expected a wedding");
    const task = await owner.mutation(api.tasks.create.handler.create, {
      weddingId: wedding._id,
      title: "Concurrent task",
    });
    const subject = { type: "task" as const, taskId: task._id };
    const duplicateArgs = {
      weddingId: wedding._id,
      subject,
      body: "Duplicate-safe",
      clientRequestId: "concurrent-duplicate",
    };
    const [duplicateA, duplicateB] = await Promise.all([
      owner.mutation(api.comments.create.handler.create, duplicateArgs),
      owner.mutation(api.comments.create.handler.create, duplicateArgs),
    ]);
    expect(duplicateA._id).toBe(duplicateB._id);

    await Promise.all([
      owner.mutation(api.comments.create.handler.create, {
        weddingId: wedding._id,
        subject,
        body: "Concurrent A",
        clientRequestId: "concurrent-a",
      }),
      owner.mutation(api.comments.create.handler.create, {
        weddingId: wedding._id,
        subject,
        body: "Concurrent B",
        clientRequestId: "concurrent-b",
      }),
    ]);
    const threadState = await t.run(async (ctx) => {
      const threads = await ctx.db
        .query("commentThreads")
        .withIndex("by_weddingId_and_subjectKey", (q) =>
          q.eq("weddingId", wedding._id).eq("subjectKey", `task:${task._id}`),
        )
        .take(2);
      return {
        count: threads.length,
        activeCount: threads[0]?.activeCount,
        rootCount: threads[0]?.rootCount,
      };
    });
    expect(threadState).toEqual({
      count: 1,
      activeCount: 3,
      rootCount: 3,
    });
  });

  it("keeps concurrent reply counts consistent", async () => {
    const t = makeConvexTest();
    const owner = await signIn(t, "owner@example.com");
    const { slug } = await createWedding(owner);
    const wedding = await weddingBySlug(t, slug);
    if (wedding === null) throw new Error("Expected a wedding");
    const task = await owner.mutation(api.tasks.create.handler.create, {
      weddingId: wedding._id,
      title: "Concurrent replies",
    });
    const subject = { type: "task" as const, taskId: task._id };
    const root = await owner.mutation(api.comments.create.handler.create, {
      weddingId: wedding._id,
      subject,
      body: "Root",
      clientRequestId: "concurrent-reply-root",
    });
    await Promise.all([
      owner.mutation(api.comments.create.handler.create, {
        weddingId: wedding._id,
        subject,
        body: "Reply A",
        clientRequestId: "concurrent-reply-a",
        replyToId: root._id,
      }),
      owner.mutation(api.comments.create.handler.create, {
        weddingId: wedding._id,
        subject,
        body: "Reply B",
        clientRequestId: "concurrent-reply-b",
        replyToId: root._id,
      }),
    ]);

    const roots = await owner.query(api.comments.listRoots.handler.listRoots, {
      weddingId: wedding._id,
      subject,
      paginationOpts: { numItems: 20, cursor: null },
    });
    expect(roots.page[0]).toMatchObject({ replyCount: 2 });
    await expect(
      owner.query(api.comments.summary.handler.summary, {
        weddingId: wedding._id,
        subject,
      }),
    ).resolves.toMatchObject({ activeCount: 3, rootCount: 1 });
  });

  it("enforces the remove rate limit", async () => {
    const t = makeConvexTest();
    const owner = await signIn(t, "owner@example.com");
    const { slug } = await createWedding(owner);
    const wedding = await weddingBySlug(t, slug);
    if (wedding === null) throw new Error("Expected a wedding");
    const task = await owner.mutation(api.tasks.create.handler.create, {
      weddingId: wedding._id,
      title: "Remove limits",
    });
    const subject = { type: "task" as const, taskId: task._id };
    const first = await owner.mutation(api.comments.create.handler.create, {
      weddingId: wedding._id,
      subject,
      body: "First",
      clientRequestId: "remove-limit-0",
    });
    const commentIds = await t.run(async (ctx) => {
      const firstDoc = await ctx.db.get(first._id);
      if (firstDoc === null) throw new Error("Expected the first comment");
      const moreIds = await Promise.all(
        Array.from({ length: 5 }, (_, index) =>
          ctx.db.insert("comments", {
            kind: "root",
            weddingId: wedding._id,
            threadId: firstDoc.threadId,
            rootId: null,
            replyToId: null,
            replyToAuthorNameSnapshot: null,
            authorId: firstDoc.authorId,
            authorNameSnapshot: firstDoc.authorNameSnapshot,
            body: `Direct root ${index}`,
            editedAt: null,
            deletedAt: null,
            isVisible: true,
            clientRequestId: `remove-limit-${index + 1}`,
            replyCount: 0,
          }),
        ),
      );
      const thread = await ctx.db.get(firstDoc.threadId);
      if (thread === null) throw new Error("Expected the comment thread");
      await ctx.db.patch(thread._id, { activeCount: 6, rootCount: 6 });
      return [first._id, ...moreIds];
    });

    for (const commentId of commentIds.slice(0, 5)) {
      await owner.mutation(api.comments.remove.handler.remove, {
        weddingId: wedding._id,
        commentId,
      });
    }
    await expect(
      owner.mutation(api.comments.remove.handler.remove, {
        weddingId: wedding._id,
        commentId: commentIds[5]!,
      }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        parseClientError(error)?.code === "COMMENTS_RATE_LIMITED",
    );
  });

  it("orders cursor pages without duplicates", async () => {
    const t = makeConvexTest();
    const owner = await signIn(t, "owner@example.com");
    const { slug } = await createWedding(owner);
    const wedding = await weddingBySlug(t, slug);
    if (wedding === null) throw new Error("Expected a wedding");
    const task = await owner.mutation(api.tasks.create.handler.create, {
      weddingId: wedding._id,
      title: "Pagination task",
    });
    const subject = { type: "task" as const, taskId: task._id };
    for (let index = 1; index <= 3; index += 1) {
      await owner.mutation(api.comments.create.handler.create, {
        weddingId: wedding._id,
        subject,
        body: `Root ${index}`,
        clientRequestId: `page-root-${index}`,
      });
    }
    const firstPage = await owner.query(
      api.comments.listRoots.handler.listRoots,
      {
        weddingId: wedding._id,
        subject,
        paginationOpts: { numItems: 1, cursor: null },
      },
    );
    const secondPage = await owner.query(
      api.comments.listRoots.handler.listRoots,
      {
        weddingId: wedding._id,
        subject,
        paginationOpts: {
          numItems: 1,
          cursor: firstPage.continueCursor,
        },
      },
    );
    expect(firstPage.page[0]?.body).toBe("Root 3");
    expect(secondPage.page[0]?.body).toBe("Root 2");
    expect(secondPage.page[0]?._id).not.toBe(firstPage.page[0]?._id);
  });

  it("orders reply pages newest-first without duplicates", async () => {
    const t = makeConvexTest();
    const owner = await signIn(t, "owner@example.com");
    const { slug } = await createWedding(owner);
    const wedding = await weddingBySlug(t, slug);
    if (wedding === null) throw new Error("Expected a wedding");
    const task = await owner.mutation(api.tasks.create.handler.create, {
      weddingId: wedding._id,
      title: "Reply pagination",
    });
    const subject = { type: "task" as const, taskId: task._id };
    const root = await owner.mutation(api.comments.create.handler.create, {
      weddingId: wedding._id,
      subject,
      body: "Root",
      clientRequestId: "reply-page-root",
    });
    for (let index = 1; index <= 3; index += 1) {
      await owner.mutation(api.comments.create.handler.create, {
        weddingId: wedding._id,
        subject,
        body: `Reply ${index}`,
        clientRequestId: `page-reply-${index}`,
        replyToId: root._id,
      });
    }
    const firstPage = await owner.query(
      api.comments.listReplies.handler.listReplies,
      {
        weddingId: wedding._id,
        subject,
        rootId: root._id,
        paginationOpts: { numItems: 1, cursor: null },
      },
    );
    const secondPage = await owner.query(
      api.comments.listReplies.handler.listReplies,
      {
        weddingId: wedding._id,
        subject,
        rootId: root._id,
        paginationOpts: {
          numItems: 1,
          cursor: firstPage.continueCursor,
        },
      },
    );
    expect(firstPage.page[0]?.body).toBe("Reply 3");
    expect(secondPage.page[0]?.body).toBe("Reply 2");
    expect(secondPage.page[0]?._id).not.toBe(firstPage.page[0]?._id);
  });

  it("shows the live member name and falls back to the snapshot", async () => {
    const t = makeConvexTest();
    const owner = await signIn(t, "owner@example.com");
    await createWedding(owner);
    const wedding = await t.run(
      async (ctx) => (await ctx.db.query("weddings").unique())!,
    );
    const planner = await addMember(t, wedding._id, "planner@example.com");
    const task = await owner.mutation(api.tasks.create.handler.create, {
      weddingId: wedding._id,
      title: "Confirm the menu",
    });
    const subject = { type: "task" as const, taskId: task._id };
    const root = await owner.mutation(api.comments.create.handler.create, {
      weddingId: wedding._id,
      subject,
      body: "Can you confirm this?",
      clientRequestId: "owner-root",
    });
    await planner.mutation(api.comments.create.handler.create, {
      weddingId: wedding._id,
      subject,
      body: "I will handle it.",
      clientRequestId: "planner-reply",
      replyToId: root._id,
    });

    await t.run(async (ctx) => {
      const members = await ctx.db
        .query("weddingMembers")
        .withIndex("by_weddingId", (q) => q.eq("weddingId", wedding._id))
        .collect();
      await Promise.all(
        members.map((member) => {
          if (member.displayName === "planner@example.com") {
            return ctx.db.patch(member._id, { displayName: "Sam Cole" });
          }
          return ctx.db.patch(member._id, { displayName: "Amy" });
        }),
      );
    });

    const roots = await planner.query(api.comments.listRoots.handler.listRoots, {
      weddingId: wedding._id,
      subject,
      paginationOpts: { numItems: 20, cursor: null },
    });
    expect(roots.page[0]).toMatchObject({ authorNameSnapshot: "Amy" });

    const replies = await owner.query(
      api.comments.listReplies.handler.listReplies,
      {
        weddingId: wedding._id,
        subject,
        rootId: root._id,
        paginationOpts: { numItems: 10, cursor: null },
      },
    );
    expect(replies.page[0]).toMatchObject({
      authorNameSnapshot: "Sam Cole",
      replyToAuthorNameSnapshot: "Amy",
    });

    await t.run(async (ctx) => {
      const plannerMember = await ctx.db
        .query("weddingMembers")
        .withIndex("by_weddingId", (q) => q.eq("weddingId", wedding._id))
        .collect();
      await Promise.all(
        plannerMember
          .filter((member) => member.displayName === "Sam Cole")
          .map((member) => ctx.db.delete(member._id)),
      );
    });

    const repliesAfterLeave = await owner.query(
      api.comments.listReplies.handler.listReplies,
      {
        weddingId: wedding._id,
        subject,
        rootId: root._id,
        paginationOpts: { numItems: 10, cursor: null },
      },
    );
    expect(repliesAfterLeave.page[0]).toMatchObject({
      authorNameSnapshot: "planner@example.com",
      replyToAuthorNameSnapshot: "Amy",
    });
  });
});
