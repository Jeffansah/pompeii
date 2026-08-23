import type { ReactNode } from "react";

export function WorkspacePage({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-6 px-4 pt-(--workspace-page-top) pb-(--workspace-page-bottom) sm:px-6">
      {children}
    </div>
  );
}
