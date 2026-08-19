import { v } from "convex/values";

import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";

import { authenticatedAction } from "../../lib/customFunctions/authenticatedAction";
import { fetchPlaceDetails } from "../lib/googlePlaces";
import { consumePlacesLookup } from "../lib/consumeLookup";

export const details = authenticatedAction({
  args: {
    placeId: v.string(),
    sessionToken: v.string(),
  },
  returns: v.object({
    placeId: v.string(),
    city: v.string(),
    country: v.string(),
    lat: v.number(),
    lng: v.number(),
  }),
  handler: async (ctx, args) => {
    const placeId = args.placeId.trim();
    if (placeId.length === 0) {
      throwAppError(AppErrorCode.places.NOT_FOUND);
    }

    await consumePlacesLookup(ctx, ctx.authUser._id);
    return await fetchPlaceDetails(placeId, args.sessionToken);
  },
});
