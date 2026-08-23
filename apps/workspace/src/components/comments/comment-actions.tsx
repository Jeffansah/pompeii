import { Delete02Icon, Edit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { TableActions } from "@/components/ui/table-actions";
import type { CommentItem } from "@/types/comments";

export function CommentActions({
  comment,
  onEdit,
  onRemove,
}: {
  comment: CommentItem;
  onEdit?: () => void;
  onRemove?: () => void;
}) {
  return (
    <TableActions
      actions={[
        {
          label: "Edit comment",
          icon: <HugeiconsIcon icon={Edit02Icon} />,
          onSelect: () => onEdit?.(),
          visible: comment.capabilities.canEdit && onEdit !== undefined,
        },
        {
          label: "Delete comment",
          icon: <HugeiconsIcon icon={Delete02Icon} />,
          onSelect: () => onRemove?.(),
          visible:
            comment.capabilities.canDelete && onRemove !== undefined,
          destructive: true,
          separator: true,
        },
      ]}
      label="Comment actions"
    />
  );
}
