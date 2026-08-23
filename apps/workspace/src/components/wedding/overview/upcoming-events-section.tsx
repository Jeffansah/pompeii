import { Add01Icon, Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { TableEmptyState } from "@/components/ui/table-empty-state";

export function UpcomingEventsSection() {
  return (
    <section
      className="flex min-w-0 flex-col gap-8"
      aria-labelledby="upcoming-events-title"
    >
      <div>
        <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
          Coming up
        </p>
        <h2 id="upcoming-events-title" className="mt-1 font-serif text-3xl">
          Upcoming events
        </h2>
      </div>
      <TableEmptyState
        action={
          <Button asChild size="sm" variant="secondary">
            <a href="#add-event">
              <HugeiconsIcon icon={Add01Icon} strokeWidth={1.5} />
              Add event
            </a>
          </Button>
        }
        icon={
          <HugeiconsIcon
            className="size-7"
            icon={Calendar03Icon}
            strokeWidth={1.5}
          />
        }
        subtitle="Event dates will live here as you add them."
        title="No events yet"
      />
    </section>
  );
}
