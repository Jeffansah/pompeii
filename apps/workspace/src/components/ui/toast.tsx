import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { CSSProperties } from "react";
import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      duration={5000}
      icons={{
        error: (
          <HugeiconsIcon
            className="size-5 text-destructive"
            icon={Alert02Icon}
            strokeWidth={1.5}
          />
        ),
        info: (
          <HugeiconsIcon
            className="size-5 text-info"
            icon={InformationCircleIcon}
            strokeWidth={1.5}
          />
        ),
        success: (
          <HugeiconsIcon
            className="size-5 text-success"
            icon={CheckmarkCircle02Icon}
            strokeWidth={1.5}
          />
        ),
        warning: (
          <HugeiconsIcon
            className="size-5 text-warning"
            icon={Alert02Icon}
            strokeWidth={1.5}
          />
        ),
      }}
      position="bottom-right"
      style={
        {
          "--border-radius": "0px",
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          actionButton:
            "h-7 !rounded-none bg-secondary px-2 text-xs text-secondary-foreground hover:bg-secondary/80",
          description: "text-sm text-muted-foreground",
          title: "font-medium",
          toast: "!rounded-none border bg-card text-card-foreground shadow-lg",
        },
      }}
    />
  );
}
