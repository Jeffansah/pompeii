import { authClient } from "./client";

export function requestMagicLink(email: string) {
  return authClient.signIn.magicLink({
    email,
    callbackURL: `${window.location.origin}/`,
  });
}
