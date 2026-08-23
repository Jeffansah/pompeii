import { FilterHorizontalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format, parse } from "date-fns";
import { type ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/shared/utils";

export type TableFilterValue =
  | string
  | {
      from?: string;
      to?: string;
    };

export type TableFilterDefinition = {
  id: string;
  label: string;
  type: "enum" | "search" | "dateRange";
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
};

export type TableFilterValues = Record<string, TableFilterValue | undefined>;

function dateFromValue(value?: string) {
  if (value === undefined) {
    return undefined;
  }
  const date = parse(value, "yyyy-MM-dd", new Date());
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function dateToValue(date: Date | undefined) {
  return date === undefined ? undefined : format(date, "yyyy-MM-dd");
}

function formatDateRangeLabel(value: { from?: string; to?: string }) {
  const from = dateFromValue(value.from);
  const to = dateFromValue(value.to);
  if (from === undefined && to === undefined) {
    return undefined;
  }
  if (from !== undefined && to === undefined) {
    return `From ${format(from, "d MMMM yyyy")}`;
  }
  if (from === undefined && to !== undefined) {
    return `Until ${format(to, "d MMMM yyyy")}`;
  }
  if (from !== undefined && to !== undefined) {
    if (from.getTime() === to.getTime()) {
      return format(from, "d MMMM yyyy");
    }
    if (
      from.getFullYear() === to.getFullYear() &&
      from.getMonth() === to.getMonth()
    ) {
      return `${format(from, "d")} to ${format(to, "d MMMM yyyy")}`;
    }
    if (from.getFullYear() === to.getFullYear()) {
      return `${format(from, "d MMMM")} to ${format(to, "d MMMM yyyy")}`;
    }
    return `${format(from, "d MMMM yyyy")} to ${format(to, "d MMMM yyyy")}`;
  }
  return undefined;
}

function filterSummary(
  definition: TableFilterDefinition,
  value: TableFilterValue | undefined,
) {
  if (value === undefined || value === "") {
    return undefined;
  }
  if (definition.type === "dateRange" && typeof value !== "string") {
    return formatDateRangeLabel(value);
  }
  if (definition.type === "enum" && typeof value === "string") {
    return (
      definition.options?.find((option) => option.value === value)?.label ??
      value
    );
  }
  return String(value);
}

function FilterEditor({
  definition,
  value,
  onChange,
}: {
  definition: TableFilterDefinition;
  value: TableFilterValue | undefined;
  onChange: (value: TableFilterValue | undefined) => void;
}) {
  if (definition.type === "enum") {
    return (
      <RadioGroup
        onValueChange={(nextValue) => {
          if (typeof nextValue === "string") {
            onChange(nextValue === value ? undefined : nextValue);
          }
        }}
        value={typeof value === "string" ? value : undefined}
      >
        {definition.options?.map((option) => (
          <label
            className="flex cursor-pointer items-center gap-2 px-2 py-2 text-sm"
            key={option.value}
          >
            <RadioGroupItem
              onClick={() => {
                if (value === option.value) {
                  onChange(undefined);
                }
              }}
              value={option.value}
            />
            {option.label}
          </label>
        ))}
      </RadioGroup>
    );
  }

  if (definition.type === "search") {
    return (
      <Input
        autoFocus
        onChange={(event) => onChange(event.target.value || undefined)}
        placeholder={definition.placeholder ?? "Search"}
        value={typeof value === "string" ? value : ""}
      />
    );
  }

  const range = typeof value === "string" ? undefined : value;
  return (
    <Calendar
      mode="range"
      onSelect={(nextRange) => {
        const nextValue = nextRange
          ? {
              from: dateToValue(nextRange.from),
              to: dateToValue(nextRange.to),
            }
          : undefined;
        onChange(
          nextValue?.from === undefined && nextValue?.to === undefined
            ? undefined
            : nextValue,
        );
      }}
      selected={{
        from: dateFromValue(range?.from),
        to: dateFromValue(range?.to),
      }}
    />
  );
}

export function TableFilters({
  definitions,
  values,
  onChange,
  onClearAll,
  className,
  renderEditor,
}: {
  definitions: TableFilterDefinition[];
  values: TableFilterValues;
  onChange: (id: string, value: TableFilterValue | undefined) => void;
  onClearAll?: () => void;
  className?: string;
  renderEditor?: (props: {
    definition: TableFilterDefinition;
    value: TableFilterValue | undefined;
    onChange: (value: TableFilterValue | undefined) => void;
  }) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [activeFilterId, setActiveFilterId] = useState<string>();
  const activeFilter = definitions.find(
    (definition) => definition.id === activeFilterId,
  );
  const activeCount = definitions.filter((definition) => {
    const value = values[definition.id];
    return value !== undefined && value !== "";
  }).length;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Popover
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setActiveFilterId(undefined);
          }
        }}
        open={open}
      >
        <PopoverTrigger asChild>
          <Button aria-expanded={open} variant="outline">
            <HugeiconsIcon icon={FilterHorizontalIcon} strokeWidth={1.5} />
            Filter
            {activeCount > 0 ? (
              <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] leading-none text-primary-foreground tabular-nums">
                {activeCount}
              </span>
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 p-2">
          {activeFilter === undefined ? (
            <div className="grid gap-1">
              <p className="px-2 py-1 text-xs text-muted-foreground">
                Filter tasks by
              </p>
              {definitions.map((definition) => {
                const summary = filterSummary(
                  definition,
                  values[definition.id],
                );
                return (
                  <button
                    className="flex cursor-pointer items-center justify-between px-2 py-2 text-left text-sm hover:bg-accent"
                    key={definition.id}
                    onClick={() => setActiveFilterId(definition.id)}
                    type="button"
                  >
                    <span>{definition.label}</span>
                    {summary ? (
                      <span className="max-w-32 truncate text-xs text-muted-foreground">
                        {summary}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid gap-2">
              <button
                className="w-fit cursor-pointer text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setActiveFilterId(undefined)}
                type="button"
              >
                Back to filters
              </button>
              <p className="text-sm font-medium">{activeFilter.label}</p>
              {renderEditor?.({
                definition: activeFilter,
                value: values[activeFilter.id],
                onChange: (value) => onChange(activeFilter.id, value),
              }) ?? (
                <FilterEditor
                  definition={activeFilter}
                  onChange={(value) => onChange(activeFilter.id, value)}
                  value={values[activeFilter.id]}
                />
              )}
            </div>
          )}
        </PopoverContent>
      </Popover>
      {definitions.map((definition) => {
        const value = values[definition.id];
        if (value === undefined || value === "") {
          return null;
        }
        return (
          <button
            className="cursor-pointer rounded-md border bg-secondary px-2.5 py-1.5 text-xs"
            key={definition.id}
            onClick={() => onChange(definition.id, undefined)}
            type="button"
          >
            {filterSummary(definition, value)}
            <span className="ml-1 text-muted-foreground">×</span>
          </button>
        );
      })}
      {activeCount > 1 ? (
        <button
          className="cursor-pointer px-1 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => {
            if (onClearAll !== undefined) {
              onClearAll();
              return;
            }
            for (const definition of definitions) {
              onChange(definition.id, undefined);
            }
          }}
          type="button"
        >
          Clear all
        </button>
      ) : null}
    </div>
  );
}
