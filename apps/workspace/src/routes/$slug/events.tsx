import { createFileRoute } from "@tanstack/react-router";

import { WorkspacePage } from "@/components/layout/workspace-page";

export const Route = createFileRoute("/$slug/events")({
  component: EventsPage,
});

function EventsPage() {
  return <WorkspacePage />;
}
