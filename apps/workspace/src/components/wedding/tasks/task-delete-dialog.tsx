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
import type { Task } from "./task-table";

export function TaskDeleteDialog({
  task,
  pending,
  onConfirm,
  onOpenChange,
}: {
  task: Task | null;
  pending: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={task !== null}>
      <DialogContent>
        <DialogHeader className="text-left">
          <DialogTitle className="font-serif text-2xl font-normal">
            Delete this task?
          </DialogTitle>
          <DialogDescription>
            This will remove "{task?.title}" from the task list.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button onClick={onConfirm} pending={pending} variant="destructive">
            Delete task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
