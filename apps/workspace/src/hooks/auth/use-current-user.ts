import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@pompeii/api";

export function useCurrentUser() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(
    api.auth.getCurrentUser,
    isAuthenticated ? {} : "skip",
  );

  return {
    user: user ?? null,
    isAuthenticated,
    isLoading,
    isUserLoading: isLoading || (isAuthenticated && user === undefined),
  };
}
