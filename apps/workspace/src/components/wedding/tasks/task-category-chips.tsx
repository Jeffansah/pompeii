import type { ComponentProps } from "react";

import { Chip, ChipGroup } from "@/components/ui/chip";
import { TASK_CATEGORIES } from "@/lib/wedding/tasks";

export function TaskCategoryChips({
  value,
  onChange,
  ...props
}: {
  value: string;
  onChange: (value: string) => void;
} & Omit<ComponentProps<"div">, "onChange">) {
  return (
    <ChipGroup aria-label="Category" {...props}>
      {TASK_CATEGORIES.map((category) => (
        <Chip
          key={category}
          onClick={() => onChange(value === category ? "" : category)}
          pressed={value === category}
        >
          {category}
        </Chip>
      ))}
    </ChipGroup>
  );
}
