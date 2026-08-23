import { Link, useParams, useRouterState } from "@tanstack/react-router";
import {
  Calendar03Icon,
  Home01Icon,
  ShoppingBag01Icon,
  TaskDaily02Icon,
  UserGroup02Icon,
  Wallet03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const WORKSPACE_NAV = [
  { label: "Overview", to: "/$slug", icon: Home01Icon },
  { label: "Tasks", to: "/$slug/tasks", icon: TaskDaily02Icon },
  { label: "Vendors", to: "/$slug/vendors", icon: ShoppingBag01Icon },
  { label: "Events", to: "/$slug/events", icon: Calendar03Icon },
  { label: "Budget", to: "/$slug/budget", icon: Wallet03Icon },
  { label: "Guests", to: "/$slug/guests", icon: UserGroup02Icon },
] as const;

function isNavActive(
  to: (typeof WORKSPACE_NAV)[number]["to"],
  slug: string,
  pathname: string,
) {
  if (to === "/$slug") {
    return pathname === `/${slug}` || pathname === `/${slug}/`;
  }
  const href = to.replace("$slug", slug);
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function WorkspaceNav() {
  const { slug } = useParams({ from: "/$slug" });
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Workspace</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="gap-2">
            {WORKSPACE_NAV.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={isNavActive(item.to, slug, pathname)}
                  tooltip={item.label}
                  className="t-workspace-nav rounded-none gap-3"
                >
                  <Link to={item.to} params={{ slug }}>
                    <HugeiconsIcon
                      icon={item.icon}
                      className="size-4"
                      strokeWidth={1.5}
                    />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}
