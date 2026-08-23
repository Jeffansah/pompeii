import { v } from "convex/values";

export const memberRoleValidator = v.union(
  v.literal("couple"),
  v.literal("planner"),
  v.literal("groomsman"),
  v.literal("bridesmaid"),
);

export type MemberRole =
  | "couple"
  | "planner"
  | "groomsman"
  | "bridesmaid";
