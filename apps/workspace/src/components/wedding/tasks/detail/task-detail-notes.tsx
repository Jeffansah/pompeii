import type { Task } from "@/types/wedding/task";

export function TaskDetailNotes({ task }: { task: Task }) {
  return (
    <div>
      <h2 className="font-serif text-2xl">Notes</h2>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
        {task.notes || "No notes have been added yet."}
      </p>
    </div>
  );
}
