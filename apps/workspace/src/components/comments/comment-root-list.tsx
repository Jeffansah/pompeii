import type { ReactNode } from "react";

export function CommentRootList({ children }: { children: ReactNode }) {
  return <div className="mt-6">{children}</div>;
}
