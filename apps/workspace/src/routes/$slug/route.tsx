import { Navigate, Outlet, createFileRoute } from "@tanstack/react-router";
import { useQuery as useConvexQuery } from "convex/react";
import { api } from "@pompeii/api";
import { useEffect } from "react";

import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { useCurrentUser } from "@/hooks/auth/use-current-user";
import { useWorkspaceStore } from "@/stores/workspace-store";

export const Route = createFileRoute("/$slug")({
  component: WeddingWorkspaceLayout,
});

function WeddingWorkspaceLayout() {
  const { slug } = Route.useParams();
  const { isAuthenticated, isLoading } = useCurrentUser();
  const workspace = useConvexQuery(
    api.weddings.getBySlug.handler.getBySlug,
    isAuthenticated ? { slug } : "skip",
  );
  const setWorkspace = useWorkspaceStore((state) => state.setWorkspace);

  useEffect(() => {
    setWorkspace(slug, workspace);
  }, [setWorkspace, slug, workspace]);

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <WorkspaceShell>
      <Outlet />
    </WorkspaceShell>
  );
}
