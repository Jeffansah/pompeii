import type { Ref } from "react";

export function CommentsHeader({
  count,
  id,
  headingRef,
}: {
  count: number;
  id: string;
  headingRef?: Ref<HTMLHeadingElement>;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2
        className="font-serif text-2xl"
        id={id}
        ref={headingRef}
        tabIndex={-1}
      >
        Comments
      </h2>
      <span
        aria-label={`${count} comments`}
        className="text-sm text-muted-foreground"
      >
        {count}
      </span>
    </div>
  );
}
