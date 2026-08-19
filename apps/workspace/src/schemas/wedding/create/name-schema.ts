import {
  AppErrorCode,
  getErrorMessage,
  WEDDING_NAME_MAX_LENGTH,
} from "@pompeii/errors";
import { z } from "zod";

export const nameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, getErrorMessage(AppErrorCode.weddings.createWedding.NAME_REQUIRED))
    .max(
      WEDDING_NAME_MAX_LENGTH,
      getErrorMessage(AppErrorCode.weddings.createWedding.NAME_TOO_LONG),
    ),
});

export type NameSchema = z.infer<typeof nameSchema>;
