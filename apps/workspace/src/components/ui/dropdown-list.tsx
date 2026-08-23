import { type ComponentProps } from "react";

import { cn } from "@/lib/shared/utils";

function DropdownList({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      className={cn(
        "relative z-20 max-h-60 w-full overflow-auto rounded-none border bg-popover p-1 text-popover-foreground shadow-md",
        className,
      )}
      {...props}
    />
  );
}

function DropdownItem({
  className,
  ...props
}: Omit<ComponentProps<"button">, "type">) {
  return (
    <button
      className={cn(
        "t-row-highlight flex w-full cursor-pointer items-center rounded-none px-2 py-2 text-left text-sm outline-none",
        className,
      )}
      data-slot="dropdown-item"
      type="button"
      {...props}
    />
  );
}

export { DropdownItem, DropdownList };
