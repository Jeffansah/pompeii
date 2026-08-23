import {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
} from "@/lib/wedding/tasks";
import {
  TableFilters,
  type TableFilterDefinition,
  type TableFilterValues,
} from "@/components/ui/table-filters";

const definitions: TableFilterDefinition[] = [
  {
    id: "priority",
    label: "Priority",
    type: "enum",
    options: TASK_PRIORITIES.map((priority) => ({
      value: priority,
      label: TASK_PRIORITY_LABELS[priority],
    })),
  },
  {
    id: "category",
    label: "Category",
    type: "enum",
    options: TASK_CATEGORIES.map((category) => ({
      value: category,
      label: category,
    })),
  },
  {
    id: "dueDate",
    label: "Due date",
    type: "dateRange",
  },
];

export function TaskFilters({
  values,
  onChange,
  onClearAll,
}: {
  values: TableFilterValues;
  onChange: (id: string, value: TableFilterValues[string]) => void;
  onClearAll?: () => void;
}) {
  return (
    <TableFilters
      definitions={definitions}
      onChange={onChange}
      onClearAll={onClearAll}
      values={values}
    />
  );
}
