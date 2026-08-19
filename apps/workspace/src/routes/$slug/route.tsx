import { Navigate, Outlet, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "@pompeii/api";

import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { useCurrentUser } from "@/hooks/auth/use-current-user";

export const Route = createFileRoute("/$slug")({
  component: WeddingWorkspaceLayout,
});

function WeddingWorkspaceLayout() {
  const { slug } = Route.useParams();
  const { isAuthenticated, isLoading } = useCurrentUser();
  const wedding = useQuery(
    api.weddings.getBySlug.handler.getBySlug,
    isAuthenticated ? { slug } : "skip",
  );

  if (isLoading) {
    return <div className="min-h-dvh bg-background" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (wedding === undefined) {
    return <div className="min-h-dvh bg-background" />;
  }

  if (wedding === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <p className="text-muted-foreground">Not found</p>
      </div>
    );
  }

  if (wedding.status === "inactive") {
    return <Navigate to="/" replace />;
  }

  return (
    <WorkspaceShell slug={slug}>
      <Outlet />
    </WorkspaceShell>
  );
}
