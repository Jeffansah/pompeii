import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import type { TaskSearch } from "@/schemas/wedding/tasks/search-schema";

export function TaskDetailNotFound({
  slug,
  search,
}: {
  slug: string;
  search: TaskSearch;
}) {
  return (
    <>
      <p className="text-sm text-muted-foreground">
        This task could not be found.
      </p>
      <Button asChild variant="secondary">
        <Link params={{ slug }} search={search} to="/$slug/tasks">
          Back to tasks
        </Link>
      </Button>
    </>
  );
}
