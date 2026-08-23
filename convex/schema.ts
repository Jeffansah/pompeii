import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    userId: v.string(),
  }).index("by_userId", ["userId"]),
  draftWeddings: defineTable({
    userId: v.id("users"),
    step: v.number(),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    coupleA: v.optional(v.string()),
    coupleB: v.optional(v.string()),
    date: v.optional(v.string()),
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    placeId: v.optional(v.string()),
    inviteEmail: v.optional(v.string()),
  }).index("by_userId", ["userId"]),
  weddings: defineTable({
    name: v.string(),
    slug: v.string(),
    couple: v.array(
      v.object({
        id: v.union(v.id("users"), v.null()),
        name: v.string(),
      }),
    ),
    date: v.optional(v.string()),
    location: v.optional(
      v.object({
        city: v.string(),
        country: v.string(),
        lat: v.number(),
        lng: v.number(),
        placeId: v.string(),
      }),
    ),
  }).index("by_slug", ["slug"]),
  weddingMembers: defineTable({
    userId: v.id("users"),
    weddingId: v.id("weddings"),
    // Denormalized for search. When a person's canonical name changes, patch
    // this field on every weddingMembers row for that user. Prefer a database
    // trigger later so this cannot be forgotten.
    displayName: v.optional(v.string()),
    role: v.union(
      v.literal("couple"),
      v.literal("planner"),
      v.literal("groomsman"),
      v.literal("bridesmaid"),
    ),
  })
    .index("by_userId", ["userId"])
    .index("by_weddingId", ["weddingId"])
    .index("by_userId_and_weddingId", ["userId", "weddingId"])
    .searchIndex("search_displayName", {
      searchField: "displayName",
      filterFields: ["weddingId"],
    }),
  workspaceSessions: defineTable({
    sessionId: v.string(),
    weddingId: v.union(v.id("weddings"), v.null()),
  }).index("by_sessionId", ["sessionId"]),
  overviewPosterCards: defineTable({
    stableKey: v.string(),
    active: v.boolean(),
    sortOrder: v.number(),
    imageKey: v.optional(v.string()),
    imageSourceUrl: v.string(),
    imageAlt: v.string(),
    imageCreator: v.string(),
    imageLicense: v.string(),
    caption: v.string(),
    locationCity: v.optional(v.string()),
    locationCountry: v.optional(v.string()),
    quote: v.string(),
    author: v.string(),
    sourceTitle: v.string(),
    sourceUrl: v.string(),
  })
    .index("by_stableKey", ["stableKey"])
    .index("by_active_and_sortOrder", ["active", "sortOrder"]),
  tasks: defineTable({
    weddingId: v.id("weddings"),
    title: v.string(),
    notes: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent"),
    ),
    // Stored as strings for now. Categories will become enums later, and
    // each subcategory will map to one of those categories.
    category: v.optional(v.string()),
    subcategory: v.optional(v.string()),
    createdBy: v.id("users"),
    assignedTo: v.union(v.id("users"), v.null()),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("completed"),
    ),
    completionSource: v.union(v.literal("manual"), v.literal("system")),
    completedAt: v.union(v.number(), v.null()),
    completedBy: v.union(v.id("users"), v.null()),
    deletedAt: v.union(v.number(), v.null()),
    sortAt: v.optional(v.number()),
    createdAt: v.optional(v.number()),
    priorityRank: v.optional(v.number()),
    dueSortAsc: v.optional(v.number()),
    dueSortDesc: v.optional(v.number()),
  })
    .index("by_wedding_status_deletedAt_dueAsc", [
      "weddingId",
      "status",
      "deletedAt",
      "dueSortAsc",
    ])
    .index("by_wedding_status_deletedAt", ["weddingId", "status", "deletedAt"])
    .index("by_wedding_status_deleted_due_priority", [
      "weddingId",
      "status",
      "deletedAt",
      "dueDate",
      "priorityRank",
      "dueSortAsc",
    ])
    .index("by_wedding_status_deletedAt_dueDesc", [
      "weddingId",
      "status",
      "deletedAt",
      "dueSortDesc",
    ])
    .index("by_wedding_status_deletedAt_priority", [
      "weddingId",
      "status",
      "deletedAt",
      "priorityRank",
      "dueSortAsc",
    ])
    .searchIndex("search_title_v2", {
      searchField: "title",
      filterFields: [
        "weddingId",
        "status",
        "deletedAt",
        "priority",
        "category",
        "assignedTo",
      ],
    })
    .index("by_wedding_deleted_completed_dueAsc", [
      "weddingId",
      "deletedAt",
      "completedAt",
      "dueSortAsc",
    ])
    .index("by_weddingId_and_status_and_deletedAt_and_assignedTo", [
      "weddingId",
      "status",
      "deletedAt",
      "assignedTo",
    ]),
  taskActivity: defineTable({
    weddingId: v.id("weddings"),
    taskId: v.id("tasks"),
    actorId: v.id("users"),
    kind: v.union(
      v.literal("created"),
      v.literal("updated"),
      v.literal("assigned"),
      v.literal("status_changed"),
      v.literal("completed"),
      v.literal("deleted"),
    ),
    field: v.optional(v.string()),
    previousValue: v.optional(v.string()),
    nextValue: v.optional(v.string()),
  })
    .index("by_taskId", ["taskId"])
    .index("by_weddingId", ["weddingId"]),
  commentThreads: defineTable({
    weddingId: v.id("weddings"),
    subject: v.object({
      type: v.literal("task"),
      taskId: v.id("tasks"),
    }),
    subjectKey: v.string(),
    activeCount: v.number(),
    rootCount: v.number(),
    lastCommentAt: v.union(v.number(), v.null()),
  }).index("by_weddingId_and_subjectKey", ["weddingId", "subjectKey"]),
  comments: defineTable(
    v.union(
      v.object({
        kind: v.literal("root"),
        weddingId: v.id("weddings"),
        threadId: v.id("commentThreads"),
        rootId: v.null(),
        replyToId: v.null(),
        replyToAuthorNameSnapshot: v.null(),
        authorId: v.id("users"),
        authorNameSnapshot: v.string(),
        body: v.string(),
        editedAt: v.union(v.number(), v.null()),
        deletedAt: v.union(v.number(), v.null()),
        isVisible: v.boolean(),
        clientRequestId: v.string(),
        replyCount: v.number(),
      }),
      v.object({
        kind: v.literal("reply"),
        weddingId: v.id("weddings"),
        threadId: v.id("commentThreads"),
        rootId: v.id("comments"),
        replyToId: v.id("comments"),
        replyToAuthorNameSnapshot: v.union(v.string(), v.null()),
        authorId: v.id("users"),
        authorNameSnapshot: v.string(),
        body: v.string(),
        editedAt: v.union(v.number(), v.null()),
        deletedAt: v.union(v.number(), v.null()),
        isVisible: v.boolean(),
        clientRequestId: v.string(),
        replyCount: v.number(),
      }),
    ),
  )
    .index("by_threadId_and_rootId_and_isVisible", [
      "threadId",
      "rootId",
      "isVisible",
    ])
    .index("by_authorId_and_clientRequestId", ["authorId", "clientRequestId"]),
  taskReminders: defineTable({
    weddingId: v.id("weddings"),
    taskId: v.id("tasks"),
    enabled: v.boolean(),
    remindAt: v.number(),
    channels: v.array(v.union(v.literal("in_app"), v.literal("email"))),
    scheduledJobId: v.optional(v.string()),
    lastTriggeredAt: v.union(v.number(), v.null()),
    deletedAt: v.union(v.number(), v.null()),
  })
    .index("by_taskId", ["taskId"])
    .index("by_remindAt_and_enabled", ["remindAt", "enabled"]),
});
