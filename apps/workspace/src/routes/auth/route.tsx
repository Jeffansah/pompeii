import { Outlet, createFileRoute, Navigate } from "@tanstack/react-router";

import { AuthShell } from "@/components/auth/auth-shell";
import { useCurrentUser } from "@/hooks/auth/use-current-user";

export const Route = createFileRoute("/auth")({
  component: AuthLayout,
});

function AuthLayout() {
  const { isAuthenticated, isLoading } = useCurrentUser();

  if (isLoading) {
    return <AuthShell />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthShell>
      <Outlet />
    </AuthShell>
  );
}
