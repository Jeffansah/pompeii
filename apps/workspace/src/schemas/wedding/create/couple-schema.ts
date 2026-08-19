import {
  AppErrorCode,
  getErrorMessage,
  COUPLE_NAME_MAX_LENGTH,
} from "@pompeii/errors";
import { z } from "zod";

export const coupleSchema = z.object({
  coupleA: z
    .string()
    .trim()
    .min(
      1,
      getErrorMessage(AppErrorCode.weddings.createWedding.COUPLE_A_REQUIRED),
    )
    .max(
      COUPLE_NAME_MAX_LENGTH,
      getErrorMessage(AppErrorCode.weddings.createWedding.COUPLE_NAME_TOO_LONG),
    ),
  coupleB: z
    .string()
    .trim()
    .min(
      1,
      getErrorMessage(AppErrorCode.weddings.createWedding.COUPLE_B_REQUIRED),
    )
    .max(
      COUPLE_NAME_MAX_LENGTH,
      getErrorMessage(AppErrorCode.weddings.createWedding.COUPLE_NAME_TOO_LONG),
    ),
});

export type CoupleSchema = z.infer<typeof coupleSchema>;
