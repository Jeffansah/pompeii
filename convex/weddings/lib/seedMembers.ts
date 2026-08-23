import type { MutationCtx } from "../../_generated/server";
import type { Doc, Id } from "../../_generated/dataModel";
import { addMember } from "./members";
import type { MemberRole } from "./roles";

export const SEED_WEDDING_MEMBERS = [
  { key: "planner-sam-cole", displayName: "Sam Cole", role: "planner" },
  { key: "planner-riley-hart", displayName: "Riley Hart", role: "planner" },
  {
    key: "groomsman-jordan-blake",
    displayName: "Jordan Blake",
    role: "groomsman",
  },
  {
    key: "groomsman-chris-adeyemi",
    displayName: "Chris Adeyemi",
    role: "groomsman",
  },
  { key: "groomsman-ben-walsh", displayName: "Ben Walsh", role: "groomsman" },
  {
    key: "groomsman-omar-farouk",
    displayName: "Omar Farouk",
    role: "groomsman",
  },
  { key: "bridesmaid-maya-chen", displayName: "Maya Chen", role: "bridesmaid" },
  {
    key: "bridesmaid-priya-shah",
    displayName: "Priya Shah",
    role: "bridesmaid",
  },
  {
    key: "bridesmaid-elena-rossi",
    displayName: "Elena Rossi",
    role: "bridesmaid",
  },
  {
    key: "bridesmaid-hannah-brooks",
    displayName: "Hannah Brooks",
    role: "bridesmaid",
  },
  {
    key: "bridesmaid-lucy-park",
    displayName: "Lucy Park",
    role: "bridesmaid",
  },
  {
    key: "bridesmaid-nina-okonkwo",
    displayName: "Nina Okonkwo",
    role: "bridesmaid",
  },
] as const satisfies ReadonlyArray<{
  key: string;
  displayName: string;
  role: Exclude<MemberRole, "couple">;
}>;

export function seedMemberUserId(slug: string, key: string) {
  return `seed:${slug}:${key}`;
}

export async function seedWeddingMembers(
  ctx: MutationCtx,
  wedding: Doc<"weddings">,
) {
  await backfillDisplayNames(ctx, wedding);

  await Promise.all(
    SEED_WEDDING_MEMBERS.map(async (seed) => {
      const userId = await userIdForSeed(
        ctx,
        seedMemberUserId(wedding.slug, seed.key),
      );
      await addMember(ctx, {
        userId,
        weddingId: wedding._id,
        displayName: seed.displayName,
        role: seed.role,
      });
    }),
  );
}

async function backfillDisplayNames(ctx: MutationCtx, wedding: Doc<"weddings">) {
  const members = await ctx.db
    .query("weddingMembers")
    .withIndex("by_weddingId", (q) => q.eq("weddingId", wedding._id))
    .take(32);

  await Promise.all(
    members.map(async (member) => {
      if (member.displayName !== undefined && member.displayName.length > 0) {
        return;
      }
      const couple = wedding.couple.find(
        (person) => person.id === member.userId,
      );
      const displayName = couple?.name ?? wedding.couple[0]?.name;
      if (displayName === undefined || displayName.length === 0) {
        return;
      }
      await ctx.db.patch(member._id, { displayName });
    }),
  );
}

async function userIdForSeed(ctx: MutationCtx, authUserId: string) {
  const existing = await ctx.db
    .query("users")
    .withIndex("by_userId", (q) => q.eq("userId", authUserId))
    .unique();
  if (existing !== null) {
    return existing._id;
  }
  return await ctx.db.insert("users", { userId: authUserId });
}

export async function seedWeddingMembersById(
  ctx: MutationCtx,
  weddingId: Id<"weddings">,
) {
  const wedding = await ctx.db.get(weddingId);
  if (wedding === null) {
    return;
  }
  await seedWeddingMembers(ctx, wedding);
}
