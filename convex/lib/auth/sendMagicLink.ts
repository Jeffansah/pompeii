import type { GenericActionCtx, GenericMutationCtx } from "convex/server";

import type { DataModel } from "../../_generated/dataModel";
import { resend } from "../email/resend";
import { normalizeEmail } from "./normalizeEmail";
import {
  setPendingMagicLinkCookie,
  type PendingCookieCtx,
} from "./pendingMagicLinkCookie";
import { rateLimiter } from "./rateLimit";

export async function sendMagicLink(
  ctx: GenericMutationCtx<DataModel> | GenericActionCtx<DataModel>,
  { email, url }: { email: string; url: string },
  authCtx?: PendingCookieCtx,
) {
  if (!("runMutation" in ctx)) {
    throw new Error("Cannot send a magic link from a query");
  }

  const emailKey = normalizeEmail(email);

  const cooldown = await rateLimiter.limit(ctx, "magicLinkCooldown", {
    key: emailKey,
  });
  if (!cooldown.ok) {
    console.info(`[magic-link] rate-limited cooldown ${emailKey}`);
    return;
  }

  const hourly = await rateLimiter.limit(ctx, "magicLinkHourly", {
    key: emailKey,
  });
  if (!hourly.ok) {
    console.info(`[magic-link] rate-limited hourly ${emailKey}`);
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    console.info(`[magic-link] ${emailKey} ${url}`);
  } else {
    await resend.sendEmail(ctx, {
      from: "Pompeii <onboarding@resend.dev>",
      to: "delivered@resend.dev",
      subject: "Sign in to Pompeii",
      html: `<p>Sign in requested for ${emailKey}.</p><p><a href="${url}">Sign in to Pompeii</a></p>`,
    });
  }

  if (authCtx) {
    await setPendingMagicLinkCookie(authCtx, emailKey);
  }
}
