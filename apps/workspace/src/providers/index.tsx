import type { ReactNode } from "react";

import { ConvexClientProvider } from "./convex-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return <ConvexClientProvider>{children}</ConvexClientProvider>;
}
