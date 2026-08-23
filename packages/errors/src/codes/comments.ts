export const commentsErrorCodes = {
  BODY_REQUIRED: "COMMENTS_BODY_REQUIRED",
  BODY_TOO_LONG: "COMMENTS_BODY_TOO_LONG",
  NOT_FOUND: "COMMENTS_NOT_FOUND",
  NOT_AUTHORIZED: "COMMENTS_NOT_AUTHORIZED",
  SUBJECT_NOT_FOUND: "COMMENTS_SUBJECT_NOT_FOUND",
  REPLY_TARGET_NOT_FOUND: "COMMENTS_REPLY_TARGET_NOT_FOUND",
  REPLY_TARGET_DELETED: "COMMENTS_REPLY_TARGET_DELETED",
  CLIENT_REQUEST_ID_INVALID: "COMMENTS_CLIENT_REQUEST_ID_INVALID",
  IDEMPOTENCY_CONFLICT: "COMMENTS_IDEMPOTENCY_CONFLICT",
  RATE_LIMITED: "COMMENTS_RATE_LIMITED",
} as const;

export const commentsErrorMessages = {
  COMMENTS_BODY_REQUIRED: "Write something before posting.",
  COMMENTS_BODY_TOO_LONG: "That comment is too long.",
  COMMENTS_NOT_FOUND: "That comment could not be found.",
  COMMENTS_NOT_AUTHORIZED: "You do not have permission to change that comment.",
  COMMENTS_SUBJECT_NOT_FOUND: "This item is no longer available for comments.",
  COMMENTS_REPLY_TARGET_NOT_FOUND: "That reply target could not be found.",
  COMMENTS_REPLY_TARGET_DELETED: "You cannot reply to a removed comment.",
  COMMENTS_CLIENT_REQUEST_ID_INVALID:
    "That comment could not be sent. Try again.",
  COMMENTS_IDEMPOTENCY_CONFLICT: "That comment request was already used.",
  COMMENTS_RATE_LIMITED:
    "You are posting comments too quickly. Try again soon.",
} as const;
