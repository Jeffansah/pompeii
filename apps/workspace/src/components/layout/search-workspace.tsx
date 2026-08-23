import type { ComponentProps } from "react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/shared/utils";

export function SearchWorkspace({
  className,
  ...props
}: ComponentProps<"input">) {
  return (
    <div className="relative w-10 min-w-0 sm:w-56">
      <HugeiconsIcon
        icon={Search01Icon}
        className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground"
        strokeWidth={1.5}
      />
      <Input
        type="search"
        aria-label="Search workspace"
        placeholder="Search workspace"
        className={cn(
          "h-10 px-0 pl-9 text-transparent sm:pl-9 sm:text-foreground",
          className,
        )}
        {...props}
      />
    </div>
  );
}
