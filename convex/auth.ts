import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth/minimal";
import { magicLink } from "better-auth/plugins";

import { components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import authConfig from "./auth.config";
import { pendingMagicLinkPlugin } from "./lib/auth/pendingMagicLinkPlugin";
import { sendMagicLink } from "./lib/auth/sendMagicLink";

const siteUrl = process.env.SITE_URL!;

export const authComponent: ReturnType<typeof createClient<DataModel>> =
  createClient<DataModel>(components.betterAuth, {
    authFunctions: internal.lib.auth.triggers,
    triggers: {
      user: {
        onCreate: async (ctx, user) => {
          await ctx.runMutation(
            internal.users.createFromAuth.handler.createFromAuth,
            { userId: user._id },
          );
        },
      },
      session: {
        onDelete: async (ctx, session) => {
          await ctx.runMutation(
            internal.weddings.deleteWorkspaceSession.handler
              .deleteWorkspaceSession,
            { sessionId: session._id },
          );
        },
      },
    },
  });

function googleSocialProvider() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return {};
  }

  return {
    google: { clientId, clientSecret },
  };
}

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: process.env.CONVEX_SITE_URL,
    trustedOrigins: [siteUrl],
    database: authComponent.adapter(ctx),
    socialProviders: googleSocialProvider(),
    plugins: [
      magicLink({
        sendMagicLink: ({ email, url }, authCtx) => {
          if (!("runMutation" in ctx)) {
            throw new Error("Cannot send a magic link from a query");
          }
          return sendMagicLink(ctx, { email, url }, authCtx);
        },
      }),
      pendingMagicLinkPlugin(),
      crossDomain({ siteUrl }),
      convex({ authConfig }),
    ],
  });
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await authComponent.safeGetAuthUser(ctx);
  },
});
