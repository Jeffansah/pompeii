import { createFileRoute } from "@tanstack/react-router";

import { WorkspacePage } from "@/components/layout/workspace-page";

export const Route = createFileRoute("/$slug/guests")({
  component: GuestsPage,
});

function GuestsPage() {
  return <WorkspacePage />;
}
