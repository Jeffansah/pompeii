import { api } from "@pompeii/api";
import type { Id } from "@pompeii/api";
import { useQuery } from "convex/react";
import { useCallback, useState } from "react";

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
import { TaskAssigneeFilterField } from "@/components/wedding/tasks/task-assignee-filter-field";
import { TaskTitleFilterEditor } from "@/components/wedding/tasks/task-title-filter-editor";
import { LoaderDots } from "@/components/ui/loader-dots";

const definitions: TableFilterDefinition[] = [
  {
    id: "title",
    label: "Title",
    type: "search",
    placeholder: "Search task titles",
  },
  {
    id: "assignee",
    label: "Assignee",
    type: "search",
    placeholder: "Search workspace members",
  },
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
  weddingId,
  values,
  onChange,
  onClearAll,
}: {
  weddingId: Id<"weddings">;
  values: TableFilterValues;
  onChange: (id: string, value: TableFilterValues[string]) => void;
  onClearAll?: () => void;
}) {
  const [assigneeSearching, setAssigneeSearching] = useState(false);
  const handleAssigneeSearching = useCallback(
    (searching: boolean) => setAssigneeSearching(searching),
    [],
  );
  const assigneeValue =
    typeof values.assignee === "string" ? values.assignee : undefined;
  const assigneeId =
    assigneeValue !== undefined && assigneeValue !== "unassigned"
      ? (assigneeValue as Id<"users">)
      : undefined;
  const member = useQuery(
    api.members.get.handler.get,
    assigneeId === undefined ? "skip" : { weddingId, userId: assigneeId },
  );
  const assigneeLabel =
    assigneeValue === "unassigned"
      ? "Unassigned"
      : member?.isSelf
        ? "Me"
        : member?.displayName
          ? member.displayName
          : assigneeValue === undefined
            ? undefined
            : "Assignee";

  return (
    <TableFilters
      definitions={definitions}
      labels={{ assignee: assigneeLabel }}
      onChange={onChange}
      onClearAll={onClearAll}
      renderFilterHeader={(definition) => (
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{definition.label}</p>
          {definition.id === "assignee" ? (
            <LoaderDots open={assigneeSearching} />
          ) : null}
        </div>
      )}
      renderEditor={({ definition, onChange, value }) => {
        if (definition.id === "title") {
          return (
            <TaskTitleFilterEditor
              onChange={onChange}
              value={typeof value === "string" ? value : undefined}
            />
          );
        }
        if (definition.id === "assignee") {
          return (
            <TaskAssigneeFilterField
              onSearching={handleAssigneeSearching}
              onChange={(nextValue) =>
                onChange(nextValue === "" ? undefined : nextValue)
              }
              selectedLabel={assigneeLabel}
              value={typeof value === "string" ? value : ""}
              weddingId={weddingId}
            />
          );
        }
        return undefined;
      }}
      values={values}
    />
  );
}
