import type { ReactNode } from "react";

import { WorkspaceHeader } from "@/components/layout/workspace-header";
import { WorkspaceNav } from "@/components/layout/workspace-nav";
import {
  Sidebar,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

export function WorkspaceShell({ children }: { children?: ReactNode }) {
  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="h-auto pointer-events-none p-0 font-serif text-3xl hover:bg-transparent group-data-[collapsible=icon]:size-auto! group-data-[collapsible=icon]:p-0!"
              >
                <span className="hidden group-data-[collapsible=icon]:block">
                  P
                </span>
                <span className="truncate group-data-[collapsible=icon]:hidden">
                  Pompeii
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <WorkspaceNav />
      </Sidebar>
      <SidebarInset className="min-h-0 overflow-y-auto">
        <WorkspaceHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
