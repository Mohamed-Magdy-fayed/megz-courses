"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { SidebarLogo } from "@/components/pages/sidebar/sidebar-logo"
import { SidebarUser } from "@/components/pages/sidebar/sidebar-user"

export function AppSidebar({ sidebarContent, ...props }: React.ComponentProps<typeof Sidebar> & { sidebarContent?: React.ReactNode }) {
  return (
    <Sidebar side="left" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarUser />
      </SidebarHeader>
      <SidebarContent className="px-1">
        {sidebarContent ? sidebarContent : ""}
      </SidebarContent>
      <SidebarFooter>
        <SidebarLogo />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
