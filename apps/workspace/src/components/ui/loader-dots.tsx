import type { ComponentProps } from "react";

import { cn } from "@/lib/shared/utils";

function LoaderDots({
  open = false,
  className,
  ...props
}: Omit<ComponentProps<"span">, "children"> & {
  open?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("t-loader-dots", className)}
      data-open={open ? "true" : "false"}
      data-slot="loader-dots"
      {...props}
    >
      <span className="t-loader-dots-inner">
        <span className="t-loader-dot" />
        <span className="t-loader-dot" />
        <span className="t-loader-dot" />
      </span>
    </span>
  );
}

export { LoaderDots };
