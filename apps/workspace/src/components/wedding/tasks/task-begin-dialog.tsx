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
import type { Task } from "@/types/wedding/task";

export function TaskBeginDialog({
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
            Begin this task?
          </DialogTitle>
          <DialogDescription>
            &ldquo;{task?.title}&rdquo; will move to In progress.
          </DialogDescription>
        </DialogHeader>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button disabled={pending} variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={onConfirm} pending={pending}>
            Begin task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
