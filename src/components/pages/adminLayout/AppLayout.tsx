import { ReactNode } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import { hasPermission } from "@/server/permissions";
import { useFCMToken } from "@/hooks/useFCMToken";

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarLogo } from "@/components/pages/sidebar/sidebar-logo";
import { SidebarUser } from "@/components/pages/sidebar/sidebar-user";
import { Separator } from "@/components/ui/separator";
import { SidebarNavBreadCrumb } from "@/components/pages/sidebar/sidebar-nav-breadcrumb";
import { SidebarNavAction, SidebarNavActionGroup, SidebarNavActions } from "@/components/pages/sidebar/sidebar-nav-actions";
import UnauthorizedAccess from "./UnauthorizedAccess";
import Spinner from "@/components/ui/Spinner";
import SidebarAdminMenu from "@/components/pages/sidebar/sidebar-admin-menu";
import SidebarGeneralMenu from "@/components/pages/sidebar/sidebar-general-menu";

export const allowedByDefault = ["/redirects"]

const AppLayout = ({ children, actions, actionGroups }: { children: ReactNode, actions?: SidebarNavAction[]; actionGroups?: SidebarNavActionGroup[] }) => {
  const { pathname } = useRouter();
  useFCMToken()

  const { data: session, status } = useSession({ required: true })

  if (status === "loading" || !session.user) return (
    <div className="grid place-content-center w-screen h-screen">
      <Spinner />
    </div>
  )

  if (!hasPermission(session.user, "adminLayout", "view")) return <UnauthorizedAccess />
  if (!hasPermission(session.user, "screens", "view", { url: pathname })
    && (!allowedByDefault.some(url => pathname.startsWith(url))
      && pathname !== "/admin")) return <UnauthorizedAccess />

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
          <SidebarUser />
          <SidebarSeparator className="mx-0" />
        </SidebarHeader>
        <SidebarContent className="px-1">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
              <SidebarAdminMenu />
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarGroupLabel>General</SidebarGroupLabel>
              <SidebarGeneralMenu />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarSeparator className="mx-0" />
          <SidebarLogo />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center gap-2 p-4 sticky top-0 z-10">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <SidebarNavBreadCrumb />
          <SidebarNavActions actionGroups={actionGroups} actions={actions} className="ml-auto" />
        </header>
        <Separator />
        <div className="p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
