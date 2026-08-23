import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Id } from "@pompeii/api";
import { api } from "@pompeii/api";

import { ArrowLeftIcon } from "@/components/icons/arrow";
import { WorkspacePage } from "@/components/layout/workspace-page";
import { Button } from "@/components/ui/button";
import { SkeletonReveal } from "@/components/ui/skeleton-reveal";
import { TaskDetail } from "@/components/wedding/tasks/detail/task-detail";
import { TaskDetailNotFound } from "@/components/wedding/tasks/detail/task-detail-not-found";
import { TaskDetailSkeleton } from "@/components/wedding/tasks/detail/task-detail-skeleton";
import { useWorkspace } from "@/stores/workspace-store";
import { taskSearchSchema } from "@/schemas/wedding/tasks/search-schema";
import type { TaskDetail as TaskDetailData } from "@/types/wedding/task";

export const Route = createFileRoute("/$slug/tasks_/$taskId")({
  validateSearch: taskSearchSchema,
  component: TaskDetailPage,
});

function TaskDetailPage() {
  const { slug, taskId } = Route.useParams();
  const workspace = useWorkspace(slug);
  const weddingId =
    workspace?.status === "active" ? workspace.weddingId : undefined;

  if (weddingId === undefined) {
    return <WorkspacePage />;
  }

  return <TaskDetailContent taskId={taskId} weddingId={weddingId} />;
}

function TaskDetailContent({
  taskId,
  weddingId,
}: {
  taskId: string;
  weddingId: Id<"weddings">;
}) {
  const navigate = useNavigate({ from: Route.fullPath });
  const { slug } = Route.useParams();
  const search = Route.useSearch();
  const taskQuery = useQuery({
    ...convexQuery(api.tasks.get.handler.get, { weddingId, taskId }),
  });
  const task = taskQuery.data as TaskDetailData | null | undefined;

  return (
    <WorkspacePage>
      <SkeletonReveal
        ready={!taskQuery.isPending}
        skeleton={<TaskDetailSkeleton />}
      >
        {taskQuery.isPending ? null : taskQuery.isError ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-destructive">
              We could not load this task.
            </p>
            <Button
              className="w-fit"
              onClick={() => void taskQuery.refetch()}
              variant="secondary"
            >
              Try again
            </Button>
          </div>
        ) : task === null || task === undefined ? (
          <TaskDetailNotFound slug={slug} search={search} />
        ) : (
          <div className="flex flex-col gap-8">
            <Link
              className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              search={search}
              to="/$slug/tasks"
              params={{ slug }}
            >
              <HugeiconsIcon icon={ArrowLeftIcon} /> Back to tasks
            </Link>
            <TaskDetail
              key={task._id}
              onDeleted={() => {
                void navigate({
                  to: "/$slug/tasks",
                  params: { slug },
                  search,
                });
              }}
              task={task}
              weddingId={weddingId}
            />
          </div>
        )}
      </SkeletonReveal>
    </WorkspacePage>
  );
}
