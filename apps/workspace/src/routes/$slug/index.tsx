import { Navigate, createFileRoute } from "@tanstack/react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useConvex } from "convex/react";
import { api } from "@pompeii/api";

import { WorkspacePage } from "@/components/layout/workspace-page";
import { useCurrentUser } from "@/hooks/auth/use-current-user";
import { useWorkspace } from "@/stores/workspace-store";
import { OverviewPosterCard } from "@/components/wedding/overview/overview-poster-card";
import { OverviewPreviewGrid } from "@/components/wedding/overview/overview-preview-grid";
import { UpcomingEventsSection } from "@/components/wedding/overview/upcoming-events-section";
import { UpcomingTasksSection } from "@/components/wedding/overview/upcoming-tasks-section";
import { WorkspaceHeadline } from "@/components/wedding/overview/workspace-headline";
import { WorkspaceHeadlineSkeleton } from "@/components/wedding/overview/workspace-headline-skeleton";

export const Route = createFileRoute("/$slug/")({
  component: OverviewPage,
});

function OverviewPage() {
  const { slug } = Route.useParams();
  const { isAuthenticated } = useCurrentUser();
  const convex = useConvex();
  const wedding = useWorkspace(slug);
  const weddingId =
    wedding?.status === "active" ? wedding.weddingId : undefined;
  const workspaceSessionId =
    wedding?.status === "active" ? wedding.workspaceSessionId : undefined;
  const posterCardQuery = useQuery({
    queryKey: [
      "editorial",
      "overview-poster-card",
      weddingId,
      workspaceSessionId,
    ],
    queryFn: () => {
      if (weddingId === undefined) {
        throw new Error("A workspace is required to load the poster card.");
      }

      const day = new Date().toISOString().slice(0, 10);

      return convex.query(api.editorial.getCurrent.handler.getCurrent, {
        weddingId,
        day,
      });
    },
    enabled:
      isAuthenticated &&
      weddingId !== undefined &&
      workspaceSessionId !== undefined,
    placeholderData: keepPreviousData,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    gcTime: 2 * 60 * 60 * 1000,
    staleTime: 60 * 60 * 1000,
    refetchInterval: 60 * 60 * 1000,
  });

  if (wedding === undefined) {
    return (
      <WorkspacePage>
        <div className="flex flex-col gap-16">
          <WorkspaceHeadlineSkeleton />
          <OverviewPosterCard card={undefined} />
        </div>
      </WorkspacePage>
    );
  }

  if (wedding === null) {
    return (
      <WorkspacePage>
        <p className="text-muted-foreground">Not found</p>
      </WorkspacePage>
    );
  }

  if (wedding.status !== "active") {
    return <Navigate to="/" replace />;
  }

  return (
    <WorkspacePage>
      <div className="flex flex-col gap-16">
        <WorkspaceHeadline
          coupleA={wedding.coupleA}
          coupleB={wedding.coupleB}
          date={wedding.date}
        />
        <OverviewPosterCard
          card={posterCardQuery.data}
          error={posterCardQuery.isError}
        />
        <OverviewPreviewGrid>
          <UpcomingTasksSection slug={slug} weddingId={wedding.weddingId} />
          <UpcomingEventsSection />
        </OverviewPreviewGrid>
      </div>
    </WorkspacePage>
  );
}
