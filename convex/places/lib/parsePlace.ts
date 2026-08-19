export type PlaceSuggestion = {
  placeId: string;
  label: string;
  mainText: string;
  secondaryText: string;
};

export type PlaceDetails = {
  placeId: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
};

function readRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readLocalizedText(value: unknown) {
  const record = readRecord(value);
  if (!record) {
    return "";
  }
  return readString(record.text).trim();
}

export function normalizePlaceId(value: string) {
  return value.replace(/^places\//, "").trim();
}

export function parseAutocomplete(payload: unknown): PlaceSuggestion[] {
  const root = readRecord(payload);
  if (!root || !Array.isArray(root.suggestions)) {
    return [];
  }

  const suggestions: PlaceSuggestion[] = [];
  for (const entry of root.suggestions) {
    const suggestion = readRecord(entry);
    const prediction = readRecord(suggestion?.placePrediction);
    if (!prediction) {
      continue;
    }

    const placeId = normalizePlaceId(
      readString(prediction.placeId) || readString(prediction.place),
    );
    if (placeId.length === 0) {
      continue;
    }

    const structured = readRecord(prediction.structuredFormat);
    const mainText = readLocalizedText(structured?.mainText);
    const secondaryText = readLocalizedText(structured?.secondaryText);
    const label =
      readLocalizedText(prediction.text) ||
      [mainText, secondaryText].filter((part) => part.length > 0).join(", ");
    if (label.length === 0) {
      continue;
    }

    suggestions.push({
      placeId,
      label,
      mainText,
      secondaryText,
    });
  }

  return suggestions;
}

function addressComponentText(
  components: unknown,
  type: string,
  field: "longText" | "shortText",
) {
  if (!Array.isArray(components)) {
    return "";
  }

  for (const entry of components) {
    const component = readRecord(entry);
    if (!component || !Array.isArray(component.types)) {
      continue;
    }
    if (!component.types.includes(type)) {
      continue;
    }
    return readString(component[field]).trim();
  }

  return "";
}

export function parsePlaceDetails(payload: unknown): PlaceDetails | null {
  const root = readRecord(payload);
  if (!root) {
    return null;
  }

  const placeId = normalizePlaceId(readString(root.id) || readString(root.name));
  const location = readRecord(root.location);
  const lat = readNumber(location?.latitude);
  const lng = readNumber(location?.longitude);
  const city =
    addressComponentText(root.addressComponents, "locality", "longText") ||
    addressComponentText(root.addressComponents, "postal_town", "longText") ||
    addressComponentText(
      root.addressComponents,
      "administrative_area_level_2",
      "longText",
    ) ||
    addressComponentText(
      root.addressComponents,
      "administrative_area_level_1",
      "longText",
    );
  const country = addressComponentText(
    root.addressComponents,
    "country",
    "longText",
  );

  if (
    placeId.length === 0 ||
    city.length === 0 ||
    country.length === 0 ||
    lat === null ||
    lng === null
  ) {
    return null;
  }

  return { placeId, city, country, lat, lng };
}
