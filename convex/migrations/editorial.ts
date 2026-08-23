import { Migrations } from "@convex-dev/migrations";
import { v } from "convex/values";

import { components } from "../_generated/api";
import { internalMutation } from "../_generated/server";
import { overviewPosterCards } from "../editorial/cards";
import schema from "../schema";

export const migrations = new Migrations(components.migrations, { schema });

const locations = {
  "ceremony-garden-junior-reis": {
    locationCity: "Bath",
    locationCountry: "United Kingdom",
  },
  "ceremony-arch-vidit-goswami": {
    locationCity: "Avignon",
    locationCountry: "France",
  },
  "empty-chairs-alexander-mass": {
    locationCity: "Florence",
    locationCountry: "Italy",
  },
  "wine-glasses-austris-augusts": {
    locationCity: "Como",
    locationCountry: "Italy",
  },
} as const;

export const addLocations = migrations.define({
  table: "overviewPosterCards",
  parallelize: true,
  migrateOne: async (ctx, card) => {
    const location = locations[card.stableKey as keyof typeof locations];
    if (
      location !== undefined &&
      (card.locationCity === undefined || card.locationCountry === undefined)
    ) {
      await ctx.db.patch(card._id, location);
    }
  },
});

export const insertDestinationCards = internalMutation({
  args: {},
  returns: v.object({
    inserted: v.number(),
    skipped: v.number(),
  }),
  handler: async (ctx) => {
    const results = await Promise.all(
      overviewPosterCards.map(async (card) => {
        const existing = await ctx.db
          .query("overviewPosterCards")
          .withIndex("by_stableKey", (q) => q.eq("stableKey", card.stableKey))
          .unique();

        if (existing !== null) {
          return "skipped" as const;
        }

        await ctx.db.insert("overviewPosterCards", card);
        return "inserted" as const;
      }),
    );

    return {
      inserted: results.filter((result) => result === "inserted").length,
      skipped: results.filter((result) => result === "skipped").length,
    };
  },
});
