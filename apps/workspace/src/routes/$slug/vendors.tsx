import { createFileRoute } from "@tanstack/react-router";

import { WorkspacePage } from "@/components/layout/workspace-page";

export const Route = createFileRoute("/$slug/vendors")({
  component: VendorsPage,
});

function VendorsPage() {
  return <WorkspacePage />;
}
