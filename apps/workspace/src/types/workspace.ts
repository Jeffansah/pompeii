import type { Id } from "@pompeii/api";

export type ActiveWorkspace = {
  status: "active";
  weddingId: Id<"weddings">;
  workspaceSessionId: Id<"workspaceSessions">;
  name: string;
  coupleA: string;
  coupleB: string;
  date?: string;
};

export type Workspace = ActiveWorkspace | { status: "inactive" } | null;
