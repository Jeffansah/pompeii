import type { ComponentProps } from "react";

import { cn } from "@/lib/shared/utils";

const BLUR_LAYERS = 6;

export function ProgressiveBlur({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      className={cn("t-progressive-blur", className)}
      {...props}
    >
      {Array.from({ length: BLUR_LAYERS }, (_, index) => (
        <div key={index} />
      ))}
    </div>
  );
}
