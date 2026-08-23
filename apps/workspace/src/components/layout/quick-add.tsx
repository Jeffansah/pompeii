import type { ComponentProps } from "react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/shared/utils";

export function QuickAdd({
  className,
  children = "Quick add",
  ...props
}: ComponentProps<"button">) {
  return (
    <>
      <Button
        asChild
        size="icon-lg"
        className={cn("shrink-0 sm:hidden", className)}
      >
        <button type="button" aria-label="Quick add" {...props}>
          <HugeiconsIcon
            icon={Add01Icon}
            className="size-4"
            strokeWidth={1.5}
          />
        </button>
      </Button>
      <Button
        type="button"
        className={cn("hidden h-10 shrink-0 sm:inline-flex", className)}
        {...props}
      >
        <HugeiconsIcon
          icon={Add01Icon}
          className="mr-2 size-4"
          strokeWidth={1.5}
        />
        {children}
      </Button>
    </>
  );
}
