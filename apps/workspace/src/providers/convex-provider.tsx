import { useState, type ReactNode } from "react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConvexReactClient } from "convex/react";
import {
  ConvexBetterAuthProvider,
  type AuthClient,
} from "@convex-dev/better-auth/react";

import { authClient } from "@/lib/auth/client";
import { OttBootstrap } from "@/components/auth/ott-bootstrap";

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

function QueryProvider({
  children,
  convex,
}: {
  children: ReactNode;
  convex: ConvexReactClient;
}) {
  const [queryClient] = useState(
    () => {
      const convexQueryClient = new ConvexQueryClient(convex);
      const client = new QueryClient({
        defaultOptions: {
          queries: {
            queryKeyHashFn: convexQueryClient.hashFn(),
            queryFn: convexQueryClient.queryFn(),
            gcTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      });
      convexQueryClient.connect(client);
      return client;
    },
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    return children;
  }

  return (
    <OttBootstrap>
      <ConvexBetterAuthProvider
        client={convex}
        authClient={authClient as unknown as AuthClient}
      >
        <QueryProvider convex={convex}>{children}</QueryProvider>
      </ConvexBetterAuthProvider>
    </OttBootstrap>
  );
}
