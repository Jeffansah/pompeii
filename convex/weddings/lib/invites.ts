import { Invitations } from "@vllnt/convex-invitations";
import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";

import { components } from "../../_generated/api";

function parseCoupleRole(value: unknown): "couple" {
  if (value !== "couple") {
    throwAppError(AppErrorCode.INTERNAL);
  }
  return "couple";
}

function parseInvitePayload(value: unknown): { email: string } {
  if (
    typeof value !== "object" ||
    value === null ||
    !("email" in value) ||
    typeof value.email !== "string"
  ) {
    throwAppError(AppErrorCode.INTERNAL);
  }
  return { email: value.email };
}

export const invites = new Invitations<"couple", { email: string }>(
  components.invitations,
  {
    ttlMs: 1000 * 60 * 60 * 24 * 7,
    roleValidator: parseCoupleRole,
    payloadValidator: parseInvitePayload,
  },
);
