import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$slug")({
  component: WeddingWorkspaceLayout,
});

function WeddingWorkspaceLayout() {
  return <Outlet />;
}
