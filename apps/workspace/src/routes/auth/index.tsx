import { Navigate, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/")({
  component: AuthIndex,
});

function AuthIndex() {
  return <Navigate to="/auth/get-started" replace />;
}
