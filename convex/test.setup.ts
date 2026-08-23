import { convexTest } from "convex-test";
import { register as registerBetterAuth } from "@convex-dev/better-auth/test";
import { register as registerMigrations } from "@convex-dev/migrations/test";
import { register as registerRateLimiter } from "@convex-dev/rate-limiter/test";
import { register as registerR2 } from "@convex-dev/r2/test";
import { register as registerWorkpool } from "@convex-dev/workpool/test";
import { register as registerInvitations } from "@vllnt/convex-invitations/test";
import aggregateSchema from "../node_modules/@convex-dev/aggregate/dist/component/schema.js";

import { components, internal } from "./_generated/api";
import schema from "./schema";

process.env.R2_PUBLIC_URL ??= "https://r2.test";

const modules = import.meta.glob("./**/*.ts");
const aggregateModules = import.meta.glob(
  "../node_modules/@convex-dev/aggregate/dist/component/**/*.js",
);

export function makeConvexTest() {
  const t = convexTest(schema, modules);
  registerBetterAuth(t);
  registerMigrations(t);
  registerRateLimiter(t);
  registerR2(t);
  registerInvitations(t as never);
  registerWorkpool(t);
  t.registerComponent("taskCounts", aggregateSchema, aggregateModules);
  return t;
}

type ConvexTest = ReturnType<typeof makeConvexTest>;

export async function signIn(t: ConvexTest, email: string) {
  const now = Date.now();
  const authUser = (await t.run(async (ctx) => {
    return await ctx.runMutation(components.betterAuth.adapter.create, {
      input: {
        model: "user",
        data: {
          createdAt: now,
          updatedAt: now,
          email,
          emailVerified: true,
          name: email,
        },
      },
    });
  })) as { _id: string };

  const session = (await t.run(async (ctx) => {
    return await ctx.runMutation(components.betterAuth.adapter.create, {
      input: {
        model: "session",
        data: {
          createdAt: now,
          updatedAt: now,
          expiresAt: now + 60 * 60 * 1000,
          token: `token-${email}`,
          userId: authUser._id,
        },
      },
    });
  })) as { _id: string };

  await t.mutation(internal.users.createFromAuth.handler.createFromAuth, {
    userId: authUser._id,
  });

  return t.withIdentity({
    subject: authUser._id,
    sessionId: session._id,
    issuer: "https://auth.example",
    tokenIdentifier: `https://auth.example|${authUser._id}`,
  });
}

export async function extraSession(
  t: ConvexTest,
  email: string,
  label: string,
) {
  const now = Date.now();
  const authUser = (await t.run(async (ctx) => {
    return await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "user",
      where: [{ field: "email", value: email }],
    });
  })) as { _id: string } | null;
  if (authUser === null) {
    throw new Error(`No auth user for ${email}`);
  }

  const session = (await t.run(async (ctx) => {
    return await ctx.runMutation(components.betterAuth.adapter.create, {
      input: {
        model: "session",
        data: {
          createdAt: now,
          updatedAt: now,
          expiresAt: now + 60 * 60 * 1000,
          token: `token-${email}-${label}`,
          userId: authUser._id,
        },
      },
    });
  })) as { _id: string };

  return t.withIdentity({
    subject: authUser._id,
    sessionId: session._id,
    issuer: "https://auth.example",
    tokenIdentifier: `https://auth.example|${authUser._id}`,
  });
}
