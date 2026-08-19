import { v } from "convex/values";

// Workspace headline: facts in, copy out. No stored stage, no mutation.
// kind is the voice, not an event id. Events can win later via a picker.
// Do not read Date.now() here. Pass now from the client when a moment needs it.
// See docs/grill-decisions.md Q45.

export const headlineKindValidator = v.literal("welcome");

export const headlineValidator = v.object({
  kind: headlineKindValidator,
  foretitle: v.string(),
  title: v.string(),
});

export function headlineFor(wedding: { name: string }) {
  return {
    kind: "welcome" as const,
    foretitle: "Welcome to",
    title: wedding.name,
  };
}
