import { v } from "convex/values";

import { authenticatedAction } from "../../lib/customFunctions/authenticatedAction";
import { fetchPlaceSuggestions } from "../lib/googlePlaces";
import { consumePlacesLookup } from "../lib/consumeLookup";

const suggestionValidator = v.object({
  placeId: v.string(),
  label: v.string(),
  mainText: v.string(),
  secondaryText: v.string(),
});

export const autocomplete = authenticatedAction({
  args: {
    input: v.string(),
    sessionToken: v.string(),
  },
  returns: v.object({
    suggestions: v.array(suggestionValidator),
  }),
  handler: async (ctx, args) => {
    const input = args.input.trim();
    if (input.length < 2) {
      return { suggestions: [] };
    }

    await consumePlacesLookup(ctx, ctx.authUser._id);
    const suggestions = await fetchPlaceSuggestions(input, args.sessionToken);
    return { suggestions };
  },
});
