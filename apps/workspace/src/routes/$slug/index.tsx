import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$slug/")({
  component: WeddingWorkspaceHome,
});

function WeddingWorkspaceHome() {
  return null;
}
