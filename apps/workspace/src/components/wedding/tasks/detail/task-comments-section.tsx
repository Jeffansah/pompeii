import { useMemo } from "react";
import type { Id } from "@pompeii/api";

import { CommentsSection } from "@/components/comments/comments-section";

export function TaskCommentsSection({
  weddingId,
  taskId,
}: {
  weddingId: Id<"weddings">;
  taskId: Id<"tasks">;
}) {
  const subject = useMemo(
    () => ({ type: "task" as const, taskId }),
    [taskId],
  );
  return (
    <CommentsSection subject={subject} weddingId={weddingId} />
  );
}
