import { QuickAdd } from "@/components/layout/quick-add";
import { SearchWorkspace } from "@/components/layout/search-workspace";
import { UserAvatar } from "@/components/layout/user-avatar";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function WorkspaceHeader() {
  return (
    <header className="sticky top-0 z-10 h-0">
      <div className="relative h-(--workspace-header-height)">
        <ProgressiveBlur />
        <div className="relative z-10 flex h-full items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6">
          <SidebarTrigger />
          <div className="flex min-w-0 items-center gap-2">
            <SearchWorkspace />
            <QuickAdd />
            <UserAvatar />
          </div>
        </div>
      </div>
    </header>
  );
}
