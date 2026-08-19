import {
  magicLinkErrorCodes,
  magicLinkErrorMessages,
} from "./magic-link";

export const loginErrorCodes = {
  magicLink: magicLinkErrorCodes,
} as const;

export const loginErrorMessages = {
  ...magicLinkErrorMessages,
} as const;
