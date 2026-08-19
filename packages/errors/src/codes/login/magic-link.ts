export const magicLinkErrorCodes = {
  EMAIL_REQUIRED: "LOGIN_MAGIC_LINK_EMAIL_REQUIRED",
  EMAIL_INVALID: "LOGIN_MAGIC_LINK_EMAIL_INVALID",
} as const;

export const magicLinkErrorMessages = {
  LOGIN_MAGIC_LINK_EMAIL_REQUIRED: "Enter your email so we can send the link.",
  LOGIN_MAGIC_LINK_EMAIL_INVALID: "That doesn't look like an email.",
} as const;
