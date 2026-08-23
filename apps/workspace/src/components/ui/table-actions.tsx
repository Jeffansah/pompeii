import { useState, type ReactNode } from "react";
import { MoreVerticalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/shared/utils";

export type TableAction = {
  label: ReactNode;
  icon: ReactNode;
  onSelect: () => void;
  visible?: boolean;
  destructive?: boolean;
  separator?: boolean;
};

export function TableActions({
  actions,
  label = "Open task actions",
  disabled = false,
  variant = "ghost",
}: {
  actions: TableAction[];
  label?: string;
  disabled?: boolean;
  variant?: "ghost" | "outline";
}) {
  const [open, setOpen] = useState(false);
  const visibleActions = actions.filter((action) => action.visible !== false);
  if (visibleActions.length === 0) return null;
  const trigger =
    variant === "outline" ? (
      <PopoverTrigger asChild>
        <Button
          aria-label={label}
          disabled={disabled}
          size="icon"
          variant="outline"
        >
          <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={1.5} />
        </Button>
      </PopoverTrigger>
    ) : (
      <PopoverTrigger
        aria-label={label}
        className="inline-flex size-7 cursor-pointer items-center justify-center rounded-none text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4"
        disabled={disabled}
      >
        <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={1.5} />
      </PopoverTrigger>
    );
  return (
    <Popover onOpenChange={setOpen} open={open && !disabled}>
      {trigger}
      <PopoverContent align="end" className="min-w-44 rounded-none p-0 py-1">
        <div className="grid">
          {visibleActions.map((action, index) => (
            <div key={index}>
              {action.separator ? (
                <div className="mt-1 h-px w-full bg-border" />
              ) : null}
              <button
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 rounded-none px-3 py-2 text-left text-sm outline-none hover:bg-accent [&_svg]:size-4",
                  action.destructive &&
                    "text-destructive hover:bg-destructive/10",
                  action.separator && "mt-1",
                )}
                onClick={() => {
                  setOpen(false);
                  action.onSelect();
                }}
                type="button"
              >
                {action.icon}
                <span className="inline-flex items-center gap-1.5">
                  {action.label}
                </span>
              </button>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
