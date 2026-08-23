import type { Id } from "@pompeii/api";

export function updateReplyDraft(
  drafts: Readonly<Record<string, string>>,
  rootId: Id<"comments">,
  body: string,
) {
  return { ...drafts, [rootId]: body };
}
