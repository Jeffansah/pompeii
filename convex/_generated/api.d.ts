/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as health_get_handler from "../health/get/handler.js";
import type * as http from "../http.js";
import type * as lib_auth_functions from "../lib/auth/functions.js";
import type * as lib_auth_normalizeEmail from "../lib/auth/normalizeEmail.js";
import type * as lib_auth_pendingMagicLinkCookie from "../lib/auth/pendingMagicLinkCookie.js";
import type * as lib_auth_pendingMagicLinkPlugin from "../lib/auth/pendingMagicLinkPlugin.js";
import type * as lib_auth_rateLimit from "../lib/auth/rateLimit.js";
import type * as lib_auth_sendMagicLink from "../lib/auth/sendMagicLink.js";
import type * as lib_auth_triggers from "../lib/auth/triggers.js";
import type * as lib_customFunctions_authenticatedAction from "../lib/customFunctions/authenticatedAction.js";
import type * as lib_customFunctions_authenticatedMutation from "../lib/customFunctions/authenticatedMutation.js";
import type * as lib_customFunctions_authenticatedQuery from "../lib/customFunctions/authenticatedQuery.js";
import type * as lib_email_resend from "../lib/email/resend.js";
import type * as login_magicLinkCooldown_handler from "../login/magicLinkCooldown/handler.js";
import type * as places_autocomplete_handler from "../places/autocomplete/handler.js";
import type * as places_details_handler from "../places/details/handler.js";
import type * as places_lib_consumeLookup from "../places/lib/consumeLookup.js";
import type * as places_lib_googlePlaces from "../places/lib/googlePlaces.js";
import type * as places_lib_parsePlace from "../places/lib/parsePlace.js";
import type * as users_createFromAuth_handler from "../users/createFromAuth/handler.js";
import type * as users_getByAuthUserId_handler from "../users/getByAuthUserId/handler.js";
import type * as weddings_create_handler from "../weddings/create/handler.js";
import type * as weddings_deleteWorkspaceSession_handler from "../weddings/deleteWorkspaceSession/handler.js";
import type * as weddings_deliverInvite_handler from "../weddings/deliverInvite/handler.js";
import type * as weddings_enter_handler from "../weddings/enter/handler.js";
import type * as weddings_getBySlug_handler from "../weddings/getBySlug/handler.js";
import type * as weddings_getDraft_handler from "../weddings/getDraft/handler.js";
import type * as weddings_getHeadline_handler from "../weddings/getHeadline/handler.js";
import type * as weddings_getHomeState_handler from "../weddings/getHomeState/handler.js";
import type * as weddings_lib_draft from "../weddings/lib/draft.js";
import type * as weddings_lib_headline from "../weddings/lib/headline.js";
import type * as weddings_lib_inviteWorkpool from "../weddings/lib/inviteWorkpool.js";
import type * as weddings_lib_invites from "../weddings/lib/invites.js";
import type * as weddings_lib_members from "../weddings/lib/members.js";
import type * as weddings_lib_slug from "../weddings/lib/slug.js";
import type * as weddings_lib_uniqueSlug from "../weddings/lib/uniqueSlug.js";
import type * as weddings_lib_workspaceSession from "../weddings/lib/workspaceSession.js";
import type * as weddings_saveDraft_handler from "../weddings/saveDraft/handler.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "health/get/handler": typeof health_get_handler;
  http: typeof http;
  "lib/auth/functions": typeof lib_auth_functions;
  "lib/auth/normalizeEmail": typeof lib_auth_normalizeEmail;
  "lib/auth/pendingMagicLinkCookie": typeof lib_auth_pendingMagicLinkCookie;
  "lib/auth/pendingMagicLinkPlugin": typeof lib_auth_pendingMagicLinkPlugin;
  "lib/auth/rateLimit": typeof lib_auth_rateLimit;
  "lib/auth/sendMagicLink": typeof lib_auth_sendMagicLink;
  "lib/auth/triggers": typeof lib_auth_triggers;
  "lib/customFunctions/authenticatedAction": typeof lib_customFunctions_authenticatedAction;
  "lib/customFunctions/authenticatedMutation": typeof lib_customFunctions_authenticatedMutation;
  "lib/customFunctions/authenticatedQuery": typeof lib_customFunctions_authenticatedQuery;
  "lib/email/resend": typeof lib_email_resend;
  "login/magicLinkCooldown/handler": typeof login_magicLinkCooldown_handler;
  "places/autocomplete/handler": typeof places_autocomplete_handler;
  "places/details/handler": typeof places_details_handler;
  "places/lib/consumeLookup": typeof places_lib_consumeLookup;
  "places/lib/googlePlaces": typeof places_lib_googlePlaces;
  "places/lib/parsePlace": typeof places_lib_parsePlace;
  "users/createFromAuth/handler": typeof users_createFromAuth_handler;
  "users/getByAuthUserId/handler": typeof users_getByAuthUserId_handler;
  "weddings/create/handler": typeof weddings_create_handler;
  "weddings/deleteWorkspaceSession/handler": typeof weddings_deleteWorkspaceSession_handler;
  "weddings/deliverInvite/handler": typeof weddings_deliverInvite_handler;
  "weddings/enter/handler": typeof weddings_enter_handler;
  "weddings/getBySlug/handler": typeof weddings_getBySlug_handler;
  "weddings/getDraft/handler": typeof weddings_getDraft_handler;
  "weddings/getHeadline/handler": typeof weddings_getHeadline_handler;
  "weddings/getHomeState/handler": typeof weddings_getHomeState_handler;
  "weddings/lib/draft": typeof weddings_lib_draft;
  "weddings/lib/headline": typeof weddings_lib_headline;
  "weddings/lib/inviteWorkpool": typeof weddings_lib_inviteWorkpool;
  "weddings/lib/invites": typeof weddings_lib_invites;
  "weddings/lib/members": typeof weddings_lib_members;
  "weddings/lib/slug": typeof weddings_lib_slug;
  "weddings/lib/uniqueSlug": typeof weddings_lib_uniqueSlug;
  "weddings/lib/workspaceSession": typeof weddings_lib_workspaceSession;
  "weddings/saveDraft/handler": typeof weddings_saveDraft_handler;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
  resend: import("@convex-dev/resend/_generated/component.js").ComponentApi<"resend">;
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
  invitations: import("@vllnt/convex-invitations/_generated/component.js").ComponentApi<"invitations">;
  workpool: import("@convex-dev/workpool/_generated/component.js").ComponentApi<"workpool">;
};
