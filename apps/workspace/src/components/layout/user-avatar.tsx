import { useParams } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "@pompeii/api";

import { MemberAvatar } from "@/components/shared/member-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonReveal } from "@/components/ui/skeleton-reveal";
import { useWorkspace } from "@/stores/workspace-store";

export function UserAvatar() {
  const { slug } = useParams({ from: "/$slug" });
  const workspace = useWorkspace(slug);
  const weddingId =
    workspace?.status === "active" ? workspace.weddingId : undefined;
  const member = useQuery(
    api.members.current.handler.current,
    weddingId === undefined ? "skip" : { weddingId },
  );

  if (workspace !== undefined && weddingId === undefined) {
    return null;
  }

  const name = member?.displayName ?? "";

  return (
    <SkeletonReveal
      className="size-10"
      ready={member !== undefined}
      skeleton={<Skeleton className="size-10 rounded-full" />}
    >
      {member === null || name.length === 0 ? null : (
        <MemberAvatar
          className="size-10"
          fallbackClassName="text-sm"
          name={name}
        />
      )}
    </SkeletonReveal>
  );
}
