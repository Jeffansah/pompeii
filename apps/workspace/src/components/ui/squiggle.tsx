import type { ReactNode } from "react";

import { cn } from "@/lib/shared/utils";

type SquiggleProps = {
  children: ReactNode;
  strokeWidth?: number;
  color?: string;
  className?: string;
};

export function Squiggle({
  children,
  strokeWidth = 8,
  color = "var(--secondary)",
  className,
}: SquiggleProps) {
  return (
    <span className={cn("relative inline-block", className)}>
      <span className="relative z-10">{children}</span>
      <svg
        aria-hidden
        viewBox="0 0 120 28"
        className="draw-squiggle pointer-events-none absolute inset-x-0 -bottom-4 z-0 w-full overflow-visible"
        preserveAspectRatio="none"
        style={{ height: `${strokeWidth * 3}px` }}
      >
        <path
          d="M1 22 C 22 21, 32 5, 54 5.5 C 72 6, 82 16, 96 16.5 C 106 17, 112 12, 119 5 C 111 13, 105 22, 96 22 C 82 21.5, 72 12, 54 13.5 C 32 15, 22 28, 1 22 Z"
          fill={color}
        />
      </svg>
    </span>
  );
}
