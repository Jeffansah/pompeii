import { z } from "zod";
import { AppErrorCode, getErrorMessage } from "@pompeii/errors";

export const commentBodySchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, getErrorMessage(AppErrorCode.comments.BODY_REQUIRED))
    .max(5000, getErrorMessage(AppErrorCode.comments.BODY_TOO_LONG)),
});

export type CommentBodyValues = z.infer<typeof commentBodySchema>;
