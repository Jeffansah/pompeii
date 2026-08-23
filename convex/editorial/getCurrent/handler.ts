import { v } from "convex/values";

import { workspaceAuthorizedQuery } from "../../lib/customFunctions/workspaceAuthorizedQuery";
import { workspaceSessionFor } from "../../weddings/lib/workspaceSession";
import { editorialCardIndex } from "../lib/selection";
import { r2PublicUrl } from "../r2";

const editorialCard = v.object({
  stableKey: v.string(),
  imageUrl: v.string(),
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
});

export const getCurrent = workspaceAuthorizedQuery({
  args: { day: v.string() },
  returns: v.union(v.null(), editorialCard),
  handler: async (ctx, args) => {
    if (typeof args.day !== "string") {
      return null;
    }

    const workspaceSession = await workspaceSessionFor(ctx, ctx.sessionId);
    if (
      workspaceSession === null ||
      workspaceSession.weddingId !== ctx.workspace._id
    ) {
      return null;
    }

    const cards = await ctx.db
      .query("overviewPosterCards")
      .withIndex("by_active_and_sortOrder", (q) => q.eq("active", true))
      .order("asc")
      .take(100);
    const index = editorialCardIndex(
      ctx.workspace._id,
      workspaceSession._id,
      args.day,
      cards.length,
    );
    if (index === null) {
      return null;
    }

    const card = cards[index];
    if (card === undefined) {
      return null;
    }
    const imageUrl =
      card.imageKey === undefined
        ? card.imageSourceUrl
        : r2PublicUrl(card.imageKey);

    return {
      stableKey: card.stableKey,
      imageUrl,
      imageAlt: card.imageAlt,
      imageCreator: card.imageCreator,
      imageLicense: card.imageLicense,
      caption: card.caption,
      ...(card.locationCity !== undefined
        ? { locationCity: card.locationCity }
        : {}),
      ...(card.locationCountry !== undefined
        ? { locationCountry: card.locationCountry }
        : {}),
      quote: card.quote,
      author: card.author,
      sourceTitle: card.sourceTitle,
      sourceUrl: card.sourceUrl,
    };
  },
});
