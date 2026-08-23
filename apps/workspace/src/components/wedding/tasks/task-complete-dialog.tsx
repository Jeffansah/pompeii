import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Task } from "@/components/wedding/tasks/task-table";

export function TaskCompleteDialog({
  task,
  error,
  pending,
  onConfirm,
  onOpenChange,
}: {
  task: Task | null;
  error: string | null;
  pending: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={task !== null}>
      <DialogContent className="gap-6">
        <DialogHeader className="gap-2 text-left">
          <DialogTitle className="font-serif text-2xl font-normal">
            Complete this task?
          </DialogTitle>
          <DialogDescription>
            "{task?.title}" will leave your upcoming tasks.
          </DialogDescription>
        </DialogHeader>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button onClick={onConfirm} pending={pending}>
            Complete task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
