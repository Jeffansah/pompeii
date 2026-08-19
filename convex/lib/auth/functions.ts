import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";

import { authComponent } from "../../auth";
import type { Doc } from "../../_generated/dataModel";
import type { ActionCtx, MutationCtx, QueryCtx } from "../../_generated/server";

export async function requireAuthUser(
  ctx: QueryCtx | MutationCtx | ActionCtx,
) {
  const authUser = await authComponent.safeGetAuthUser(ctx);
  if (!authUser) {
    throwAppError(AppErrorCode.UNAUTHENTICATED);
  }
  return authUser;
}

export async function requireSessionId(
  ctx: QueryCtx | MutationCtx | ActionCtx,
) {
  const identity = await ctx.auth.getUserIdentity();
  const sessionId = identity?.sessionId;
  if (typeof sessionId !== "string" || sessionId.length === 0) {
    throwAppError(AppErrorCode.UNAUTHENTICATED);
  }
  return sessionId;
}

async function findAppUser(ctx: QueryCtx | MutationCtx, authUserId: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_userId", (q) => q.eq("userId", authUserId))
    .unique();
}

export async function requireAppUser(
  ctx: QueryCtx,
  authUserId: string,
): Promise<Doc<"users">> {
  const user = await findAppUser(ctx, authUserId);
  if (user === null) {
    throwAppError(AppErrorCode.UNAUTHENTICATED);
  }
  return user;
}

export async function ensureAppUser(
  ctx: MutationCtx,
  authUserId: string,
): Promise<Doc<"users">> {
  const existing = await findAppUser(ctx, authUserId);
  if (existing) {
    return existing;
  }
  const id = await ctx.db.insert("users", { userId: authUserId });
  const user = await ctx.db.get(id);
  if (user === null) {
    throwAppError(AppErrorCode.INTERNAL);
  }
  return user;
}
