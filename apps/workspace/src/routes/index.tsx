import { Navigate, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "@pompeii/api";

import { AuthShell } from "@/components/auth/auth-shell";
import { WeddingPicker } from "@/components/wedding/picker";
import { useCurrentUser } from "@/hooks/auth/use-current-user";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { isAuthenticated, isLoading } = useCurrentUser();
  const home = useQuery(
    api.weddings.getHomeState.handler.getHomeState,
    isAuthenticated ? {} : "skip",
  );

  if (isLoading || (isAuthenticated && home === undefined)) {
    return <div className="min-h-dvh bg-background" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/get-started" replace />;
  }

  if (home === undefined) {
    return <div className="min-h-dvh bg-background" />;
  }

  if (home.destination === "workspace") {
    return <Navigate to="/$slug" params={{ slug: home.slug }} replace />;
  }

  if (home.destination === "create") {
    return <Navigate to="/new" replace />;
  }

  return (
    <AuthShell>
      <WeddingPicker weddings={home.weddings} />
    </AuthShell>
  );
}
