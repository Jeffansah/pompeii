import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format, isValid, parse } from "date-fns";
import { type ComponentProps, useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import { inputVariants } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/shared/utils";

function dateFromValue(value?: string) {
  if (value === undefined || value.length === 0) {
    return undefined;
  }
  const parsed = parse(value, "yyyy-MM-dd", new Date());
  if (!isValid(parsed)) {
    return undefined;
  }
  return parsed;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  allowPast = false,
  className,
  ...props
}: {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  allowPast?: boolean;
} & Omit<
  ComponentProps<"button">,
  "type" | "value" | "onChange" | "children"
>) {
  const [open, setOpen] = useState(false);
  const selected = dateFromValue(value);
  const label = selected ? format(selected, "d MMMM yyyy") : placeholder;

  return (
    <Popover modal={false} onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            inputVariants({ variant: "line" }),
            "flex cursor-pointer items-center gap-2 text-left font-normal",
            selected === undefined && "text-muted-foreground",
            className,
          )}
          type="button"
          {...props}
        >
          <HugeiconsIcon
            className="size-4"
            icon={Calendar03Icon}
            strokeWidth={1.5}
          />
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <Calendar
          allowPast={allowPast}
          mode="single"
          onSelect={(date) => {
            onChange(date ? format(date, "yyyy-MM-dd") : undefined);
            setOpen(false);
          }}
          selected={selected}
        />
      </PopoverContent>
    </Popover>
  );
}
