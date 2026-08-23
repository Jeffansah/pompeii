import {
  AppErrorCode,
  COUPLE_NAME_MAX_LENGTH,
  PLACE_ID_MAX_LENGTH,
  PLACE_MAX_LENGTH,
  throwAppError,
  WEDDING_NAME_MAX_LENGTH,
} from "@pompeii/errors/convex";

import { authenticatedMutation } from "../../lib/customFunctions/authenticatedMutation";
import { draftsForUser, draftValidator, toDraft } from "../lib/draft";
import { slugify } from "../lib/slug";

export const saveDraft = authenticatedMutation({
  args: draftValidator.fields,
  returns: draftValidator,
  handler: async (ctx, args) => {
    const drafts = await draftsForUser(ctx, ctx.user._id);
    const existing = drafts[0];
    const patch = buildPatch(args);
    const step = Math.max(existing?.step ?? 0, args.step);

    if (existing) {
      await ctx.db.patch(existing._id, { ...patch, step });
      await Promise.all(
        drafts.slice(1).map((extra) => ctx.db.delete(extra._id)),
      );
      const next = await ctx.db.get(existing._id);
      if (next === null) {
        throwAppError(AppErrorCode.INTERNAL);
      }
      return toDraft(next);
    }

    const id = await ctx.db.insert("draftWeddings", {
      userId: ctx.user._id,
      step,
      ...patch,
    });
    const created = await ctx.db.get(id);
    if (created === null) {
      throwAppError(AppErrorCode.INTERNAL);
    }
    return toDraft(created);
  },
});

function buildPatch(args: {
  name?: string;
  coupleA?: string;
  coupleB?: string;
  date?: string;
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
  placeId?: string;
  inviteEmail?: string;
}) {
  const patch: {
    name?: string;
    slug?: string;
    coupleA?: string;
    coupleB?: string;
    date?: string;
    city?: string;
    country?: string;
    lat?: number;
    lng?: number;
    placeId?: string;
    inviteEmail?: string;
  } = {};

  if (args.name !== undefined) {
    const name = args.name.trim();
    if (name.length === 0) {
      throwAppError(AppErrorCode.weddings.createWedding.NAME_REQUIRED);
    }
    if (name.length > WEDDING_NAME_MAX_LENGTH) {
      throwAppError(AppErrorCode.weddings.createWedding.NAME_TOO_LONG);
    }
    patch.name = name;
    patch.slug = slugify(name);
  }
  if (args.coupleA !== undefined) {
    patch.coupleA = requireCoupleName(
      args.coupleA,
      AppErrorCode.weddings.createWedding.COUPLE_A_REQUIRED,
    );
  }
  if (args.coupleB !== undefined) {
    patch.coupleB = requireCoupleName(
      args.coupleB,
      AppErrorCode.weddings.createWedding.COUPLE_B_REQUIRED,
    );
  }
  if (args.date !== undefined) {
    patch.date = optionalDate(args.date);
  }
  Object.assign(patch, requirePlace(args));
  if (args.inviteEmail !== undefined) {
    patch.inviteEmail = optionalInviteEmail(args.inviteEmail);
  }

  return patch;
}

function requireCoupleName(
  value: string,
  emptyCode:
    | typeof AppErrorCode.weddings.createWedding.COUPLE_A_REQUIRED
    | typeof AppErrorCode.weddings.createWedding.COUPLE_B_REQUIRED,
) {
  const name = value.trim();
  if (name.length === 0) {
    throwAppError(emptyCode);
  }
  if (name.length > COUPLE_NAME_MAX_LENGTH) {
    throwAppError(AppErrorCode.weddings.createWedding.COUPLE_NAME_TOO_LONG);
  }
  return name;
}

const DATE_VALUE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_VALUE_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function optionalDate(value: string) {
  const date = value.trim();
  if (date.length === 0) {
    return "";
  }
  if (!DATE_VALUE_PATTERN.test(date)) {
    throwAppError(AppErrorCode.weddings.createWedding.DATE_INVALID);
  }
  if (date < todayDateValue()) {
    throwAppError(AppErrorCode.weddings.createWedding.DATE_IN_PAST);
  }
  return date;
}

function todayDateValue() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function optionalPlace(
  value: string,
  tooLongCode:
    | typeof AppErrorCode.weddings.createWedding.CITY_TOO_LONG
    | typeof AppErrorCode.weddings.createWedding.COUNTRY_TOO_LONG,
) {
  const place = value.trim();
  if (place.length > PLACE_MAX_LENGTH) {
    throwAppError(tooLongCode);
  }
  return place;
}

function requirePlace(args: {
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
  placeId?: string;
}) {
  const hasAny =
    args.city !== undefined ||
    args.country !== undefined ||
    args.lat !== undefined ||
    args.lng !== undefined ||
    args.placeId !== undefined;
  if (!hasAny) {
    return {};
  }
  if (
    args.city === undefined ||
    args.country === undefined ||
    args.lat === undefined ||
    args.lng === undefined ||
    args.placeId === undefined
  ) {
    throwAppError(AppErrorCode.weddings.createWedding.PLACE_REQUIRED);
  }

  const city = optionalPlace(
    args.city,
    AppErrorCode.weddings.createWedding.CITY_TOO_LONG,
  );
  const country = optionalPlace(
    args.country,
    AppErrorCode.weddings.createWedding.COUNTRY_TOO_LONG,
  );
  const placeId = args.placeId.trim();
  if (city.length === 0 || country.length === 0 || placeId.length === 0) {
    throwAppError(AppErrorCode.weddings.createWedding.PLACE_REQUIRED);
  }
  if (placeId.length > PLACE_ID_MAX_LENGTH) {
    throwAppError(AppErrorCode.weddings.createWedding.PLACE_ID_INVALID);
  }
  if (args.lat < -90 || args.lat > 90 || args.lng < -180 || args.lng > 180) {
    throwAppError(AppErrorCode.weddings.createWedding.COORDINATES_INVALID);
  }

  return {
    city,
    country,
    lat: args.lat,
    lng: args.lng,
    placeId,
  };
}

function optionalInviteEmail(value: string) {
  const email = value.trim().toLowerCase();
  if (email.length === 0) {
    return "";
  }
  if (!EMAIL_VALUE_PATTERN.test(email)) {
    throwAppError(AppErrorCode.weddings.createWedding.INVITE_EMAIL_INVALID);
  }
  return email;
}
