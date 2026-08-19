import { describe, expect, it } from "vitest";

import { parseAutocomplete, parsePlaceDetails } from "./parsePlace";

describe("parseAutocomplete", () => {
  it("maps place predictions and skips query predictions", () => {
    expect(
      parseAutocomplete({
        suggestions: [
          {
            queryPrediction: { text: { text: "accra restaurants" } },
          },
          {
            placePrediction: {
              place: "places/ChIJc6e3soSQ3w8R0XwZ9o7pBAQ",
              placeId: "ChIJc6e3soSQ3w8R0XwZ9o7pBAQ",
              text: { text: "Accra, Ghana" },
              structuredFormat: {
                mainText: { text: "Accra" },
                secondaryText: { text: "Ghana" },
              },
            },
          },
        ],
      }),
    ).toEqual([
      {
        placeId: "ChIJc6e3soSQ3w8R0XwZ9o7pBAQ",
        label: "Accra, Ghana",
        mainText: "Accra",
        secondaryText: "Ghana",
      },
    ]);
  });

  it("returns an empty list for an unknown payload", () => {
    expect(parseAutocomplete(null)).toEqual([]);
    expect(parseAutocomplete({})).toEqual([]);
  });
});

describe("parsePlaceDetails", () => {
  it("reads city, country, and coordinates", () => {
    expect(
      parsePlaceDetails({
        id: "places/ChIJc6e3soSQ3w8R0XwZ9o7pBAQ",
        location: { latitude: 5.6037, longitude: -0.187 },
        addressComponents: [
          { longText: "Accra", types: ["locality", "political"] },
          { longText: "Ghana", shortText: "GH", types: ["country", "political"] },
        ],
      }),
    ).toEqual({
      placeId: "ChIJc6e3soSQ3w8R0XwZ9o7pBAQ",
      city: "Accra",
      country: "Ghana",
      lat: 5.6037,
      lng: -0.187,
    });
  });

  it("falls back to postal town when locality is missing", () => {
    expect(
      parsePlaceDetails({
        id: "ChIJ",
        location: { latitude: 51.5074, longitude: -0.1278 },
        addressComponents: [
          { longText: "London", types: ["postal_town"] },
          { longText: "United Kingdom", types: ["country", "political"] },
        ],
      }),
    ).toMatchObject({ city: "London", country: "United Kingdom" });
  });

  it("returns null when city or coordinates are missing", () => {
    expect(
      parsePlaceDetails({
        id: "ChIJ",
        location: { latitude: 5.6, longitude: -0.18 },
        addressComponents: [{ longText: "Ghana", types: ["country"] }],
      }),
    ).toBeNull();
  });
});
