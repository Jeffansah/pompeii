import { AppErrorCode, getErrorMessage } from "@pompeii/errors";
import { z } from "zod";

export const DATE_VALUE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

export function todayDateValue() {
  const now = new Date();
  return `${now.getFullYear()}-${padDatePart(now.getMonth() + 1)}-${padDatePart(now.getDate())}`;
}

export const dateSchema = z.object({
  date: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || DATE_VALUE_PATTERN.test(value),
      getErrorMessage(AppErrorCode.weddings.createWedding.DATE_INVALID),
    )
    .refine(
      (value) =>
        value.length === 0 ||
        !DATE_VALUE_PATTERN.test(value) ||
        value >= todayDateValue(),
      getErrorMessage(AppErrorCode.weddings.createWedding.DATE_IN_PAST),
    ),
});

export type DateSchema = z.infer<typeof dateSchema>;
