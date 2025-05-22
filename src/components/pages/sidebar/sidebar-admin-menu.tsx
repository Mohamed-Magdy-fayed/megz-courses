import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChevronRight } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuAction, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, } from "@/components/ui/sidebar";
import { mainNavLinks } from "@/components/pages/sidebar/sidebar-admin-data";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const SidebarAdminMenu = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
    ({ className, ...props }, ref) => {
        const { pathname } = useRouter()

        return (
            <div ref={ref} className={className} {...props}>
                <SidebarMenu>
                    {mainNavLinks
                        .filter(navLink => navLink.label !== "General")
                        .map(navLink =>
                            navLink.children && navLink.children.length ? (
                                <>
                                    <Collapsible
                                        key={navLink.label}
                                        defaultOpen={navLink.children.some(
                                            child => child.url && pathname.startsWith(child.url)
                                        )}
                                    >
                                        <CollapsibleTrigger
                                            asChild
                                            aria-activedescendant={navLink.children.some(
                                                child => child.url && pathname.startsWith(child.url)
                                            ) ? "true" : "false"}
                                            className="w-full group group-data-[collapsible=icon]:hidden"
                                        >
                                            <SidebarMenuItem>
                                                <SidebarMenuButton
                                                    tooltip={navLink.label}
                                                    size="sm"
                                                    className="w-full flex justify-between items-center aria-[activedescendant=true]:bg-accent/60"
                                                    aria-activedescendant={navLink.children.some(
                                                        child => child.url && pathname.startsWith(child.url)
                                                    ) ? "true" : "false"}
                                                >
                                                    {navLink.icon ? <navLink.icon /> : <span className="w-4 h-4 inline-block" />}
                                                    <span className="flex-1 text-left">{navLink.label}</span>
                                                    <SidebarMenuAction className="transition-transform duration-200 group-data-[state=open]:rotate-90 ml-auto">
                                                        <ChevronRight />
                                                        <span className="sr-only">Toggle</span>
                                                    </SidebarMenuAction>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                                            <SidebarMenuSub>
                                                {navLink.children.map(subItem => (
                                                    <SidebarMenuSubItem key={subItem.url || subItem.label}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            aria-activedescendant={subItem.url && pathname.startsWith(subItem.url) ? "true" : "false"}
                                                            className="aria-[activedescendant=true]:bg-accent/60"
                                                        >
                                                            {subItem.url ? (
                                                                <Link href={subItem.url}>
                                                                    {subItem.icon ? <subItem.icon /> : <span className="w-4 h-4 inline-block" />}
                                                                    <span>{subItem.label}</span>
                                                                </Link>
                                                            ) : (
                                                                <span>{subItem.label}</span>
                                                            )}
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </Collapsible>
                                    <DropdownMenu
                                        key={navLink.label}
                                    >
                                        <DropdownMenuTrigger asChild className="w-full group group-data-[collapsible=]:hidden group-data-[mobile=true]/sidebar-sheet:hidden">
                                            <SidebarMenuItem>
                                                <SidebarMenuButton
                                                    tooltip={navLink.label}
                                                    size="sm"
                                                    className="w-full flex justify-between items-center aria-[activedescendant=true]:bg-accent/60"
                                                    aria-activedescendant={navLink.children.some(
                                                        child => child.url && pathname.startsWith(child.url)
                                                    ) ? "true" : "false"}
                                                >
                                                    {navLink.icon ? <navLink.icon /> : <span className="w-4 h-4 inline-block" />}
                                                    <span className="flex-1 text-left">{navLink.label}</span>
                                                    <SidebarMenuAction className="transition-transform duration-200 ml-auto">
                                                        <ChevronRight />
                                                        <span className="sr-only">Toggle</span>
                                                    </SidebarMenuAction>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side="right" className="overflow-hidden transition-all">
                                            <DropdownMenuGroup>
                                                {navLink.children.map(subItem => (
                                                    <DropdownMenuItem
                                                        asChild
                                                        key={subItem.url || subItem.label}
                                                        aria-activedescendant={subItem.url && pathname.startsWith(subItem.url) ? "true" : "false"}
                                                        className="aria-[activedescendant=true]:bg-accent/60"
                                                    >
                                                        {subItem.url ? (
                                                            <Link href={subItem.url}>
                                                                {subItem.icon ? <subItem.icon size={20} /> : <span className="w-4 h-4 inline-block" />}
                                                                <span>{subItem.label}</span>
                                                            </Link>
                                                        ) : (
                                                            <span>{subItem.label}</span>
                                                        )}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>
                            ) : (
                                <SidebarMenuItem key={navLink.url || navLink.label}>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={navLink.label}
                                        size="sm"
                                        aria-activedescendant={navLink.url && pathname.startsWith(navLink.url) ? "true" : "false"}
                                        className="aria-[activedescendant=true]:bg-accent/60"
                                    >
                                        {navLink.url ? (
                                            <Link href={navLink.url}>
                                                {navLink.icon ? <navLink.icon /> : <span className="w-4 h-4 inline-block" />}
                                                <span>{navLink.label}</span>
                                            </Link>
                                        ) : (
                                            <span className="flex items-center">
                                                {navLink.icon ? <navLink.icon /> : <span className="w-4 h-4 inline-block" />}
                                                <span>{navLink.label}</span>
                                            </span>
                                        )}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        )}
                </SidebarMenu>
            </div>
        );
    }
);

SidebarAdminMenu.displayName = "SidebarAdminMenu";
export default SidebarAdminMenu;