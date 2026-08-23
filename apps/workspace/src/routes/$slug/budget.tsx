import { createFileRoute } from "@tanstack/react-router";

import { WorkspacePage } from "@/components/layout/workspace-page";

export const Route = createFileRoute("/$slug/budget")({
  component: BudgetPage,
});

function BudgetPage() {
  return <WorkspacePage />;
}
