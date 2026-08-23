import { create } from "zustand";

import type { Workspace } from "@/types/workspace";

type WorkspaceStore = {
  slug: string | null;
  workspace: Workspace | null | undefined;
  setWorkspace: (slug: string, workspace: Workspace | null | undefined) => void;
};

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  slug: null,
  workspace: undefined,
  setWorkspace: (slug, workspace) => set({ slug, workspace }),
}));

export function useWorkspace(slug: string) {
  return useWorkspaceStore((state) =>
    state.slug === slug ? state.workspace : undefined,
  );
}
