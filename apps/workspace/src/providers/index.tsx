import type { ReactNode } from "react";

import { Toaster } from "../components/ui/toast";
import { ConvexClientProvider } from "./convex-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConvexClientProvider>
      {children}
      <Toaster />
    </ConvexClientProvider>
  );
}
