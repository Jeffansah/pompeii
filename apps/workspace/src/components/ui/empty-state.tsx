import type { ReactNode } from "react";

import { cn } from "@/lib/shared/utils";

export function EmptyState({
  icon,
  title,
  subtitle,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-56 flex-col items-center justify-center px-5 py-14 text-center sm:px-6",
        className,
      )}
    >
      <div className="relative flex size-16 items-center justify-center">
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-sidebar"
        />
        <div className="relative text-sidebar-accent-foreground">{icon}</div>
      </div>
      <h3 className="mt-5 font-medium">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{subtitle}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
