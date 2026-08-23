import { cn } from "@/lib/shared/utils";

export function TaskCategoryChip({
  category,
  className,
}: {
  category: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-none border border-input bg-transparent px-2.5 text-xs whitespace-nowrap",
        className,
      )}
    >
      {category}
    </span>
  );
}
