import type { ComponentProps } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/shared/utils";

export function TableEmptyState({
  className,
  ...props
}: ComponentProps<typeof EmptyState>) {
  return (
    <div
      className={cn("overflow-hidden rounded-none border bg-card", className)}
    >
      <EmptyState {...props} />
    </div>
  );
}
