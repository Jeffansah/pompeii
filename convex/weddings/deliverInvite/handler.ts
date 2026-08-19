import { v } from "convex/values";

import { internalAction } from "../../_generated/server";

export const deliverInvite = internalAction({
  args: {
    email: v.string(),
    slug: v.string(),
    token: v.string(),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    const origin = (process.env.SITE_URL ?? "").replace(/\/$/, "");
    console.info(
      `[partner-invite] ${args.email} ${origin}/${args.slug}/invite/${args.token}`,
    );
    return null;
  },
});
