import { Navigate, createFileRoute } from "@tanstack/react-router";

import { AuthShell } from "@/components/auth/auth-shell";
import { CreateWeddingStepper } from "@/components/wedding/create/stepper";
import { useCurrentUser } from "@/hooks/auth/use-current-user";

export const Route = createFileRoute("/new")({
  component: NewPage,
});

function NewPage() {
  const { isAuthenticated, isLoading } = useCurrentUser();

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/auth/get-started" replace />;
  }

  return (
    <AuthShell>
      <CreateWeddingStepper />
    </AuthShell>
  );
}
