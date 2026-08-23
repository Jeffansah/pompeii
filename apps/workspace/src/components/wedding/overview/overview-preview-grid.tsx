import type { ReactNode } from "react";

export function OverviewPreviewGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-8">
      {children}
    </div>
  );
}
