import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";
import { v } from "convex/values";

import { internal } from "../../_generated/api";
import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { authenticatedMutation } from "../../lib/customFunctions/authenticatedMutation";
import { draftsForUser } from "../lib/draft";
import { inviteWorkpool } from "../lib/inviteWorkpool";
import { invites } from "../lib/invites";
import { addCoupleMember } from "../lib/members";
import { uniqueSlug } from "../lib/uniqueSlug";
import { setWorkspaceSession } from "../lib/workspaceSession";

export const create = authenticatedMutation({
  args: {},
  returns: v.object({ slug: v.string() }),
  handler: async (ctx) => {
    const drafts = await draftsForUser(ctx, ctx.user._id);
    const draft = drafts[0];
    if (draft === undefined) {
      throwAppError(AppErrorCode.weddings.createWedding.NAME_REQUIRED);
    }

    const name = requirePresent(
      draft.name,
      AppErrorCode.weddings.createWedding.NAME_REQUIRED,
    );
    const coupleA = requirePresent(
      draft.coupleA,
      AppErrorCode.weddings.createWedding.COUPLE_A_REQUIRED,
    );
    const coupleB = requirePresent(
      draft.coupleB,
      AppErrorCode.weddings.createWedding.COUPLE_B_REQUIRED,
    );

    const slug = await uniqueSlug(ctx, name);
    const weddingId = await ctx.db.insert("weddings", {
      name,
      slug,
      couple: [
        { id: ctx.user._id, name: coupleA },
        { id: null, name: coupleB },
      ],
      ...optionalDate(draft.date),
      ...optionalLocation(draft),
    });

    await maybeIssueInvite(ctx, {
      weddingId,
      slug,
      inviterId: ctx.user._id,
      inviteEmail: draft.inviteEmail,
    });

    await addCoupleMember(ctx, ctx.user._id, weddingId, coupleA);
    await setWorkspaceSession(ctx, ctx.sessionId, weddingId);

    await Promise.all(drafts.map((row) => ctx.db.delete(row._id)));
    return { slug };
  },
});

function requirePresent(
  value: string | undefined,
  emptyCode:
    | typeof AppErrorCode.weddings.createWedding.NAME_REQUIRED
    | typeof AppErrorCode.weddings.createWedding.COUPLE_A_REQUIRED
    | typeof AppErrorCode.weddings.createWedding.COUPLE_B_REQUIRED,
) {
  if (value === undefined || value.length === 0) {
    throwAppError(emptyCode);
  }
  return value;
}

function optionalDate(date: string | undefined) {
  if (date === undefined || date.length === 0) {
    return {};
  }
  return { date };
}

function optionalLocation(draft: Doc<"draftWeddings">) {
  if (
    draft.city === undefined ||
    draft.country === undefined ||
    draft.lat === undefined ||
    draft.lng === undefined ||
    draft.placeId === undefined
  ) {
    return {};
  }
  if (
    draft.city.length === 0 ||
    draft.country.length === 0 ||
    draft.placeId.length === 0
  ) {
    return {};
  }
  return {
    location: {
      city: draft.city,
      country: draft.country,
      lat: draft.lat,
      lng: draft.lng,
      placeId: draft.placeId,
    },
  };
}

async function maybeIssueInvite(
  ctx: MutationCtx,
  args: {
    weddingId: Id<"weddings">;
    slug: string;
    inviterId: Id<"users">;
    inviteEmail: string | undefined;
  },
) {
  const email = args.inviteEmail;
  if (email === undefined || email.length === 0) {
    return;
  }

  const { token } = await invites.issue(ctx, args.weddingId, {
    role: "couple",
    inviterRef: args.inviterId,
    inviteeRef: email,
    payload: { email },
  });

  await inviteWorkpool.enqueueAction(
    ctx,
    internal.weddings.deliverInvite.handler.deliverInvite,
    { email, slug: args.slug, token },
  );
}
