"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/pages/LearningLayout/nav-user"
import { NavLogo } from "@/components/pages/LearningLayout/nav-logo"

export function AppSidebar({ sidebarContent, ...props }: React.ComponentProps<typeof Sidebar> & { sidebarContent?: React.ReactNode }) {
  return (
    <Sidebar side="left" collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser />
      </SidebarHeader>
      <SidebarContent>
        {sidebarContent ? sidebarContent : "No content provided"}
      </SidebarContent>
      <SidebarFooter>
        <NavLogo />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
