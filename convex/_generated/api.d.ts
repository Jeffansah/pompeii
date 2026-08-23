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
import type * as editorial_cards from "../editorial/cards.js";
import type * as editorial_getCurrent_handler from "../editorial/getCurrent/handler.js";
import type * as editorial_lib_selection from "../editorial/lib/selection.js";
import type * as editorial_r2 from "../editorial/r2.js";
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
import type * as lib_customFunctions_workspaceAuthorizedMutation from "../lib/customFunctions/workspaceAuthorizedMutation.js";
import type * as lib_customFunctions_workspaceAuthorizedQuery from "../lib/customFunctions/workspaceAuthorizedQuery.js";
import type * as lib_email_resend from "../lib/email/resend.js";
import type * as login_magicLinkCooldown_handler from "../login/magicLinkCooldown/handler.js";
import type * as members_search_handler from "../members/search/handler.js";
import type * as migrations_editorial from "../migrations/editorial.js";
import type * as migrations_members from "../migrations/members.js";
import type * as migrations_tasks from "../migrations/tasks.js";
import type * as places_autocomplete_handler from "../places/autocomplete/handler.js";
import type * as places_details_handler from "../places/details/handler.js";
import type * as places_lib_consumeLookup from "../places/lib/consumeLookup.js";
import type * as places_lib_googlePlaces from "../places/lib/googlePlaces.js";
import type * as places_lib_parsePlace from "../places/lib/parsePlace.js";
import type * as tasks_complete_handler from "../tasks/complete/handler.js";
import type * as tasks_counts_handler from "../tasks/counts/handler.js";
import type * as tasks_create_handler from "../tasks/create/handler.js";
import type * as tasks_delete_handler from "../tasks/delete/handler.js";
import type * as tasks_get_handler from "../tasks/get/handler.js";
import type * as tasks_getCompleted_handler from "../tasks/getCompleted/handler.js";
import type * as tasks_getUpcoming_handler from "../tasks/getUpcoming/handler.js";
import type * as tasks_lib_activity from "../tasks/lib/activity.js";
import type * as tasks_lib_getTask from "../tasks/lib/getTask.js";
import type * as tasks_lib_ordering from "../tasks/lib/ordering.js";
import type * as tasks_lib_validators from "../tasks/lib/validators.js";
import type * as tasks_list_handler from "../tasks/list/handler.js";
import type * as tasks_move_handler from "../tasks/move/handler.js";
import type * as tasks_pickup_handler from "../tasks/pickup/handler.js";
import type * as tasks_release_handler from "../tasks/release/handler.js";
import type * as tasks_start_handler from "../tasks/start/handler.js";
import type * as tasks_update_handler from "../tasks/update/handler.js";
import type * as users_createFromAuth_handler from "../users/createFromAuth/handler.js";
import type * as users_current_handler from "../users/current/handler.js";
import type * as users_getByAuthUserId_handler from "../users/getByAuthUserId/handler.js";
import type * as weddings_create_handler from "../weddings/create/handler.js";
import type * as weddings_deleteWorkspaceSession_handler from "../weddings/deleteWorkspaceSession/handler.js";
import type * as weddings_deliverInvite_handler from "../weddings/deliverInvite/handler.js";
import type * as weddings_enter_handler from "../weddings/enter/handler.js";
import type * as weddings_getBySlug_handler from "../weddings/getBySlug/handler.js";
import type * as weddings_getDraft_handler from "../weddings/getDraft/handler.js";
import type * as weddings_getHomeState_handler from "../weddings/getHomeState/handler.js";
import type * as weddings_lib_draft from "../weddings/lib/draft.js";
import type * as weddings_lib_inviteWorkpool from "../weddings/lib/inviteWorkpool.js";
import type * as weddings_lib_invites from "../weddings/lib/invites.js";
import type * as weddings_lib_members from "../weddings/lib/members.js";
import type * as weddings_lib_roles from "../weddings/lib/roles.js";
import type * as weddings_lib_seedMembers from "../weddings/lib/seedMembers.js";
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
  "editorial/cards": typeof editorial_cards;
  "editorial/getCurrent/handler": typeof editorial_getCurrent_handler;
  "editorial/lib/selection": typeof editorial_lib_selection;
  "editorial/r2": typeof editorial_r2;
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
  "lib/customFunctions/workspaceAuthorizedMutation": typeof lib_customFunctions_workspaceAuthorizedMutation;
  "lib/customFunctions/workspaceAuthorizedQuery": typeof lib_customFunctions_workspaceAuthorizedQuery;
  "lib/email/resend": typeof lib_email_resend;
  "login/magicLinkCooldown/handler": typeof login_magicLinkCooldown_handler;
  "members/search/handler": typeof members_search_handler;
  "migrations/editorial": typeof migrations_editorial;
  "migrations/members": typeof migrations_members;
  "migrations/tasks": typeof migrations_tasks;
  "places/autocomplete/handler": typeof places_autocomplete_handler;
  "places/details/handler": typeof places_details_handler;
  "places/lib/consumeLookup": typeof places_lib_consumeLookup;
  "places/lib/googlePlaces": typeof places_lib_googlePlaces;
  "places/lib/parsePlace": typeof places_lib_parsePlace;
  "tasks/complete/handler": typeof tasks_complete_handler;
  "tasks/counts/handler": typeof tasks_counts_handler;
  "tasks/create/handler": typeof tasks_create_handler;
  "tasks/delete/handler": typeof tasks_delete_handler;
  "tasks/get/handler": typeof tasks_get_handler;
  "tasks/getCompleted/handler": typeof tasks_getCompleted_handler;
  "tasks/getUpcoming/handler": typeof tasks_getUpcoming_handler;
  "tasks/lib/activity": typeof tasks_lib_activity;
  "tasks/lib/getTask": typeof tasks_lib_getTask;
  "tasks/lib/ordering": typeof tasks_lib_ordering;
  "tasks/lib/validators": typeof tasks_lib_validators;
  "tasks/list/handler": typeof tasks_list_handler;
  "tasks/move/handler": typeof tasks_move_handler;
  "tasks/pickup/handler": typeof tasks_pickup_handler;
  "tasks/release/handler": typeof tasks_release_handler;
  "tasks/start/handler": typeof tasks_start_handler;
  "tasks/update/handler": typeof tasks_update_handler;
  "users/createFromAuth/handler": typeof users_createFromAuth_handler;
  "users/current/handler": typeof users_current_handler;
  "users/getByAuthUserId/handler": typeof users_getByAuthUserId_handler;
  "weddings/create/handler": typeof weddings_create_handler;
  "weddings/deleteWorkspaceSession/handler": typeof weddings_deleteWorkspaceSession_handler;
  "weddings/deliverInvite/handler": typeof weddings_deliverInvite_handler;
  "weddings/enter/handler": typeof weddings_enter_handler;
  "weddings/getBySlug/handler": typeof weddings_getBySlug_handler;
  "weddings/getDraft/handler": typeof weddings_getDraft_handler;
  "weddings/getHomeState/handler": typeof weddings_getHomeState_handler;
  "weddings/lib/draft": typeof weddings_lib_draft;
  "weddings/lib/inviteWorkpool": typeof weddings_lib_inviteWorkpool;
  "weddings/lib/invites": typeof weddings_lib_invites;
  "weddings/lib/members": typeof weddings_lib_members;
  "weddings/lib/roles": typeof weddings_lib_roles;
  "weddings/lib/seedMembers": typeof weddings_lib_seedMembers;
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
  migrations: import("@convex-dev/migrations/_generated/component.js").ComponentApi<"migrations">;
  resend: import("@convex-dev/resend/_generated/component.js").ComponentApi<"resend">;
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
  r2: import("@convex-dev/r2/_generated/component.js").ComponentApi<"r2">;
  invitations: import("@vllnt/convex-invitations/_generated/component.js").ComponentApi<"invitations">;
  workpool: import("@convex-dev/workpool/_generated/component.js").ComponentApi<"workpool">;
};
