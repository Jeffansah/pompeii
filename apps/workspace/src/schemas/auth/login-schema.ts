import { AppErrorCode, getErrorMessage } from "@pompeii/errors";
import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, getErrorMessage(AppErrorCode.login.magicLink.EMAIL_REQUIRED))
    .toLowerCase()
    .pipe(z.email(getErrorMessage(AppErrorCode.login.magicLink.EMAIL_INVALID))),
});

export type LoginSchema = z.infer<typeof loginSchema>;
