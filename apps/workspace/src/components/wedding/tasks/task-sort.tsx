import { useState } from "react";
import { Sorting05Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TextSwap } from "@/components/ui/text-swap";

export type TaskSort =
  | "default"
  | "dueDateAsc"
  | "dueDateDesc"
  | "priority"
  | "createdDesc"
  | "createdAsc";

const options: Array<{ value: TaskSort; label: string; triggerLabel: string }> =
  [
    { value: "default", label: "Default", triggerLabel: "Default" },
    {
      value: "dueDateAsc",
      label: "Earliest due date",
      triggerLabel: "Earliest due",
    },
    {
      value: "dueDateDesc",
      label: "Latest due date",
      triggerLabel: "Latest due",
    },
    { value: "priority", label: "Highest priority", triggerLabel: "Priority" },
    {
      value: "createdDesc",
      label: "Recently added",
      triggerLabel: "Recently added",
    },
    {
      value: "createdAsc",
      label: "Oldest added",
      triggerLabel: "Oldest added",
    },
  ];

export function TaskSort({
  value,
  onChange,
  searchActive = false,
}: {
  value?: TaskSort;
  onChange: (value: TaskSort) => void;
  searchActive?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  const label = searchActive
    ? "Relevance"
    : (selected?.triggerLabel ?? "Sort by");

  return (
    <Popover
      onOpenChange={(nextOpen) => {
        if (!searchActive) {
          setOpen(nextOpen);
        }
      }}
      open={searchActive ? false : open}
    >
      <PopoverTrigger asChild>
        <Button
          aria-label={searchActive ? "Sort tasks by relevance" : "Sort tasks"}
          variant="outline"
        >
          <HugeiconsIcon icon={Sorting05Icon} strokeWidth={1.5} />
          <TextSwap>{label}</TextSwap>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-2">
        <p className="px-2 py-1 text-xs text-muted-foreground">Sort tasks by</p>
        <RadioGroup
          onValueChange={(nextValue) => {
            const nextSort = options.find(
              (option) => option.value === nextValue,
            )?.value;
            if (nextSort !== undefined) {
              onChange(nextSort);
            }
          }}
          value={value}
        >
          {options.map((option) => (
            <label
              className="flex cursor-pointer items-center gap-2 px-2 py-2 text-sm"
              key={option.value}
            >
              <RadioGroupItem value={option.value} />
              {option.label}
            </label>
          ))}
        </RadioGroup>
      </PopoverContent>
    </Popover>
  );
}
