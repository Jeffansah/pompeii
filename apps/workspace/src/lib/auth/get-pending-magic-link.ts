import { authClient } from "./client";

export async function getPendingMagicLinkEmail() {
  try {
    const { data } = await authClient.$fetch<{ email: string | null }>(
      "/pending-magic-link",
    );
    return data?.email ?? null;
  } catch {
    return null;
  }
}
