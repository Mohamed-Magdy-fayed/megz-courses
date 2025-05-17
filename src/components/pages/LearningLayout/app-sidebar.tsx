"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavMain } from "@/components/pages/LearningLayout/nav-main"
import { NavUser } from "@/components/pages/LearningLayout/nav-user"
import { NavLogo } from "@/components/pages/LearningLayout/nav-logo"
import { api } from "@/lib/api"
import { useRouter } from "next/router"
import { Skeleton } from "@/components/ui/skeleton"
import { DisplayError } from "@/components/ui/display-error"
import { BookIcon } from "lucide-react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const courseSlug = router.query.courseSlug as string;

  const { data, isLoading, isError, error } = api.courses.getLearningMenu.useQuery({ courseSlug })

  return (
    <Sidebar side="left" collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser />
      </SidebarHeader>
      <SidebarContent>
        {isLoading && !error ? (
          <Skeleton className="w-full h-full" />
        ) : isError && error ? (
          <DisplayError message={error.message} />
        ) : !data.courseStatues ? (
          <DisplayError message={`No data.courseStatues!`} />
        ) : (
          <NavMain
            items={data.courseStatues.map(courseStatus => ({
              icon: BookIcon,
              title: courseStatus.level?.name || "Level Name",
              items: courseStatus.level?.materialItems.map(item => ({ title: item.title, url: `/student/my_courses/${courseSlug}/${courseStatus.level?.slug}/session/${item.slug}` }))
            }))}
          />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavLogo />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
