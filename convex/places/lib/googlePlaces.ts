import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";

import { normalizePlaceId, parseAutocomplete, parsePlaceDetails } from "./parsePlace";

const AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";
const AUTOCOMPLETE_FIELD_MASK = [
  "suggestions.placePrediction.placeId",
  "suggestions.placePrediction.place",
  "suggestions.placePrediction.text",
  "suggestions.placePrediction.structuredFormat",
].join(",");
const DETAILS_FIELD_MASK = "id,location,addressComponents";

function placesApiKey() {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    throwAppError(AppErrorCode.places.UNAVAILABLE);
  }
  return key;
}

async function readGoogleJson(response: Response) {
  try {
    return await response.json();
  } catch {
    throwAppError(AppErrorCode.places.UNAVAILABLE);
  }
}

export async function fetchPlaceSuggestions(input: string, sessionToken: string) {
  const response = await fetch(AUTOCOMPLETE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": placesApiKey(),
      "X-Goog-FieldMask": AUTOCOMPLETE_FIELD_MASK,
    },
    body: JSON.stringify({
      input,
      includedPrimaryTypes: ["locality"],
      languageCode: "en",
      sessionToken,
    }),
  });
  const payload = await readGoogleJson(response);
  if (!response.ok) {
    throwAppError(AppErrorCode.places.UNAVAILABLE);
  }
  return parseAutocomplete(payload);
}

export async function fetchPlaceDetails(placeId: string, sessionToken: string) {
  const id = normalizePlaceId(placeId);
  const url = new URL(`https://places.googleapis.com/v1/places/${id}`);
  url.searchParams.set("sessionToken", sessionToken);
  url.searchParams.set("languageCode", "en");

  const response = await fetch(url, {
    headers: {
      "X-Goog-Api-Key": placesApiKey(),
      "X-Goog-FieldMask": DETAILS_FIELD_MASK,
    },
  });
  const payload = await readGoogleJson(response);
  if (response.status === 404) {
    throwAppError(AppErrorCode.places.NOT_FOUND);
  }
  if (!response.ok) {
    throwAppError(AppErrorCode.places.UNAVAILABLE);
  }
  const place = parsePlaceDetails(payload);
  if (place === null) {
    throwAppError(AppErrorCode.places.NOT_FOUND);
  }
  return place;
}
