import { R2 } from "@convex-dev/r2";

import { components } from "../_generated/api";

export const r2 = new R2(components.r2);

const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");

export function r2PublicUrl(key: string) {
  if (publicUrl === undefined) {
    throw new Error("R2_PUBLIC_URL is not configured.");
  }

  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  return `${publicUrl}/${encodedKey}`;
}
