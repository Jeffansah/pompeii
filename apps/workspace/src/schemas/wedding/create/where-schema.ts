import {
  AppErrorCode,
  getErrorMessage,
  PLACE_ID_MAX_LENGTH,
  PLACE_MAX_LENGTH,
} from "@pompeii/errors";
import { z } from "zod";

const placeRequired = getErrorMessage(
  AppErrorCode.weddings.createWedding.PLACE_REQUIRED,
);
const coordinatesInvalid = getErrorMessage(
  AppErrorCode.weddings.createWedding.COORDINATES_INVALID,
);

export const whereSchema = z.object({
  city: z
    .string()
    .trim()
    .min(1, placeRequired)
    .max(
      PLACE_MAX_LENGTH,
      getErrorMessage(AppErrorCode.weddings.createWedding.CITY_TOO_LONG),
    ),
  country: z
    .string()
    .trim()
    .min(1, placeRequired)
    .max(
      PLACE_MAX_LENGTH,
      getErrorMessage(AppErrorCode.weddings.createWedding.COUNTRY_TOO_LONG),
    ),
  lat: z.number().min(-90, coordinatesInvalid).max(90, coordinatesInvalid),
  lng: z.number().min(-180, coordinatesInvalid).max(180, coordinatesInvalid),
  placeId: z
    .string()
    .trim()
    .min(1, placeRequired)
    .max(
      PLACE_ID_MAX_LENGTH,
      getErrorMessage(AppErrorCode.weddings.createWedding.PLACE_ID_INVALID),
    ),
});

export type WhereSchema = z.infer<typeof whereSchema>;
