import { constantTimeEqual, makeSignature } from "better-auth/crypto";

export const PENDING_MAGIC_LINK_COOKIE = "pompeii_ml_pending";
export const PENDING_MAGIC_LINK_MAX_AGE_SECONDS = 5 * 60;

const PENDING_TTL_MS = PENDING_MAGIC_LINK_MAX_AGE_SECONDS * 1000;

export type PendingCookieCtx = {
  setCookie: (
    name: string,
    value: string,
    attributes: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: "none";
      maxAge: number;
      path: string;
    },
  ) => void;
  getCookie: (name: string) => string | null | undefined;
};

function cookieAttributes(maxAge: number) {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,
    maxAge,
    path: "/",
  };
}

function authSecret() {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET is not set");
  }
  return secret;
}

function toBase64Url(value: string) {
  return btoa(value).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(value: string) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/");
  const pad =
    padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return atob(padded + pad);
}

function readCookieValue(authCtx: PendingCookieCtx) {
  return (
    authCtx.getCookie(PENDING_MAGIC_LINK_COOKIE) ||
    authCtx.getCookie(`__Secure-${PENDING_MAGIC_LINK_COOKIE}`) ||
    null
  );
}

async function signPendingEmail(email: string) {
  const exp = Date.now() + PENDING_TTL_MS;
  const payload = JSON.stringify({ email, exp });
  const signature = await makeSignature(payload, authSecret());
  return `${toBase64Url(payload)}.${toBase64Url(signature)}`;
}

async function verifyPendingEmail(value: string) {
  const separator = value.indexOf(".");
  if (separator === -1) {
    return null;
  }
  try {
    const payload = fromBase64Url(value.slice(0, separator));
    const signature = fromBase64Url(value.slice(separator + 1));
    const expected = await makeSignature(payload, authSecret());
    if (!constantTimeEqual(signature, expected)) {
      return null;
    }
    const parsed: unknown = JSON.parse(payload);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("email" in parsed) ||
      !("exp" in parsed) ||
      typeof parsed.email !== "string" ||
      typeof parsed.exp !== "number" ||
      parsed.exp <= Date.now()
    ) {
      return null;
    }
    return parsed.email;
  } catch {
    return null;
  }
}

export async function setPendingMagicLinkCookie(
  authCtx: PendingCookieCtx,
  email: string,
) {
  const value = await signPendingEmail(email);
  authCtx.setCookie(
    PENDING_MAGIC_LINK_COOKIE,
    value,
    cookieAttributes(PENDING_MAGIC_LINK_MAX_AGE_SECONDS),
  );
}

export function clearPendingMagicLinkCookie(authCtx: PendingCookieCtx) {
  authCtx.setCookie(PENDING_MAGIC_LINK_COOKIE, "", cookieAttributes(0));
}

export async function readPendingMagicLinkEmail(authCtx: PendingCookieCtx) {
  const value = readCookieValue(authCtx);
  if (!value) {
    return null;
  }
  return await verifyPendingEmail(value);
}
