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
    role: v.literal("couple"),
  })
    .index("by_userId", ["userId"])
    .index("by_weddingId", ["weddingId"])
    .index("by_userId_and_weddingId", ["userId", "weddingId"]),
  workspaceSessions: defineTable({
    sessionId: v.string(),
    weddingId: v.union(v.id("weddings"), v.null()),
  }).index("by_sessionId", ["sessionId"]),
});
