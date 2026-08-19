import type { ReactNode } from "react";

import { UserAvatar } from "@/components/layout/user-avatar";
import { WorkspaceHeadline } from "@/components/layout/workspace-headline";
import {
  Sidebar,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function WorkspaceShell({
  slug,
  children,
}: {
  slug: string;
  children?: ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="h-auto pointer-events-none p-0 text-3xl hover:bg-transparent group-data-[collapsible=icon]:size-auto! group-data-[collapsible=icon]:p-0!"
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
      </Sidebar>
      <SidebarInset className="gap-6 p-4">
        <header className="flex h-12 shrink-0 items-center justify-between">
          <SidebarTrigger />
          <UserAvatar />
        </header>
        <WorkspaceHeadline slug={slug} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

