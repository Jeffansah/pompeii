import { v } from "convex/values";

import type { Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { getTaskForWorkspace } from "../../tasks/lib/getTask";
import { AppErrorCode } from "@pompeii/errors/convex";

export const commentSubjectValidator = v.object({
  type: v.literal("task"),
  taskId: v.id("tasks"),
});

export type CommentSubject = {
  type: "task";
  taskId: Id<"tasks">;
};

export function subjectKey(subject: CommentSubject) {
  return `${subject.type}:${subject.taskId}`;
}

export async function assertCommentableSubject(
  ctx: QueryCtx | MutationCtx,
  weddingId: Id<"weddings">,
  subject: CommentSubject,
) {
  if (subject.type === "task") {
    await getTaskForWorkspace(
      ctx,
      subject.taskId,
      weddingId,
      AppErrorCode.comments.SUBJECT_NOT_FOUND,
    );
    return;
  }
}
