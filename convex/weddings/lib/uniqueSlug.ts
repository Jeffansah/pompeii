import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";

import type { MutationCtx } from "../../_generated/server";
import { slugify } from "./slug";

export async function uniqueSlug(ctx: MutationCtx, name: string) {
  const base = slugify(name);
  for (let n = 1; n <= 1000; n += 1) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    const taken = await ctx.db
      .query("weddings")
      .withIndex("by_slug", (q) => q.eq("slug", candidate))
      .unique();
    if (taken === null) {
      return candidate;
    }
  }
  throwAppError(AppErrorCode.INTERNAL);
}
