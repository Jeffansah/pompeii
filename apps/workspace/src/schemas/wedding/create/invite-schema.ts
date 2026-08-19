import { AppErrorCode, getErrorMessage } from "@pompeii/errors";
import { z } from "zod";

export const inviteSchema = z.object({
  inviteEmail: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(
      z.union([
        z.literal(""),
        z.email(
          getErrorMessage(
            AppErrorCode.weddings.createWedding.INVITE_EMAIL_INVALID,
          ),
        ),
      ]),
    ),
});

export type InviteSchema = z.infer<typeof inviteSchema>;
