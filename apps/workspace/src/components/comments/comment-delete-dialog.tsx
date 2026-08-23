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
import type { CommentItem } from "@/types/comments";

export function CommentDeleteDialog({
  comment,
  error,
  pending,
  onConfirm,
  onOpenChange,
}: {
  comment: CommentItem | null;
  error?: string | null;
  pending: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={comment !== null}>
      <DialogContent>
        <DialogHeader className="text-left">
          <DialogTitle className="font-serif text-2xl font-normal">
            Delete this comment?
          </DialogTitle>
          <DialogDescription>
            {comment?.kind === "root" && comment.replyCount > 0
              ? "Replies will remain visible under a removed comment."
              : "This comment will be removed from the conversation."}
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
          <Button onClick={onConfirm} pending={pending} variant="destructive">
            Delete comment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
