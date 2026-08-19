import { useQuery } from "convex/react";
import { api } from "@pompeii/api";

import { Skeleton } from "@/components/ui/skeleton";

export function WorkspaceHeadline({ slug }: { slug: string }) {
  const headline = useQuery(api.weddings.getHeadline.handler.getHeadline, {
    slug,
  });

  if (headline === undefined) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-48 sm:h-12 sm:w-72" />
      </div>
    );
  }

  if (headline === null || headline.status !== "active") {
    return null;
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm text-muted-foreground capitalize">
        {headline.foretitle}
      </p>
      <h1 className="text-4xl sm:text-5xl capitalize">{headline.title}</h1>
    </div>
  );
}
