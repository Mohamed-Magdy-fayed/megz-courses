import React from "react";
import Link from "next/link";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/router";

import {
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import { mainNavLinks } from "@/components/pages/sidebar/sidebar-admin-data";

const SidebarGeneralMenu = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
    ({ className, ...props }, ref) => {
        const generalLinks = mainNavLinks.find(navLink => navLink.label === "General")?.children || [];
        const { pathname } = useRouter()

        return (
            <div ref={ref} className={className} {...props}>
                <SidebarMenu>
                    {generalLinks.map(link => (
                        <SidebarMenuItem key={link.url || link.label}>
                            <SidebarMenuButton
                                tooltip={link.label}
                                asChild
                                size="sm"
                                aria-activedescendant={link.url && pathname.startsWith(link.url) ? "true" : "false"}
                                className="aria-[activedescendant=true]:bg-accent/60"
                            >
                                {link.url ? (
                                    <Link href={link.url}>
                                        {link.icon ? <link.icon /> : <Loader2Icon />}
                                        <span>{link.label}</span>
                                    </Link>
                                ) : (
                                    <span className="flex items-center">
                                        {link.icon ? <link.icon /> : <Loader2Icon />}
                                        <span>{link.label}</span>
                                    </span>
                                )}
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </div>
        );
    }
);

SidebarGeneralMenu.displayName = "SidebarGeneralMenu";
export default SidebarGeneralMenu;