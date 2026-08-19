export const placesErrorCodes = {
  RATE_LIMITED: "PLACES_RATE_LIMITED",
  UNAVAILABLE: "PLACES_UNAVAILABLE",
  NOT_FOUND: "PLACES_NOT_FOUND",
} as const;

export const placesErrorMessages = {
  PLACES_RATE_LIMITED: "Too many searches, wait a moment and try again.",
  PLACES_UNAVAILABLE: "We couldn't look up that place. Try again.",
  PLACES_NOT_FOUND: "We couldn't find that place.",
} as const;
