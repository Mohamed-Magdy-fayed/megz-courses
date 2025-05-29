import React from "react";

import {
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

const SidebarSekeltonMenu = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
    ({ className, ...props }, ref) => {
        return (
            <div ref={ref} className={className} {...props}>
                <SidebarMenu>
                    <SidebarGroupLabel>Loading...</SidebarGroupLabel>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <SidebarMenuItem key={i}>
                            <SidebarMenuButton size="sm" className="flex items-center gap-2">
                                <Skeleton className="w-5 h-5 rounded-md" />
                                <Skeleton className="h-4 w-full rounded" />
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </div>
        );
    }
);

SidebarSekeltonMenu.displayName = "SidebarSekeltonMenu";
export default SidebarSekeltonMenu;
