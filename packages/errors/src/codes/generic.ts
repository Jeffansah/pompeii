export const genericErrorCodes = {
  INTERNAL: "INTERNAL",
  UNAUTHENTICATED: "UNAUTHENTICATED",
} as const;

export const genericErrorMessages = {
  INTERNAL: "Something went wrong.",
  UNAUTHENTICATED: "You need to sign in.",
} as const;
