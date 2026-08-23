import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/shared/utils";

function ChipGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="chip-group"
      className={cn("flex flex-wrap gap-2", className)}
      {...props}
    />
  );
}

function Chip({
  pressed = false,
  className,
  children,
  ...props
}: Omit<ComponentProps<"button">, "type"> & {
  pressed?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      data-slot="chip"
      data-pressed={pressed ? "true" : "false"}
      aria-pressed={pressed}
      type="button"
      className={cn(
        "inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-none border px-2.5 text-xs whitespace-nowrap transition-colors outline-none",
        "focus-visible:ring-[3px] focus-visible:ring-ring/50",
        pressed
          ? "border-transparent bg-accent text-accent-foreground"
          : "border-input bg-transparent text-foreground hover:bg-accent",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export { Chip, ChipGroup };
