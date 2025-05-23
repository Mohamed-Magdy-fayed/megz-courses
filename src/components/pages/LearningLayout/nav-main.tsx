"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChevronRight, type LucideIcon } from "lucide-react";

import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuAction, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, SidebarGroupLabel } from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type NavMainProps = {
    sidebarLabel?: string;
    items: {
        title: string;
        url?: string;
        icon?: LucideIcon;
        action?: React.ReactNode;
        isActive?: boolean;
        items?: {
            title: string;
            url: string;
            icon?: LucideIcon;
        }[];
    }[];
};

export function NavMain({ items, sidebarLabel }: NavMainProps) {
    const { pathname } = useRouter();

    const menuItems = useMemo(() => items, [items]);

    return (
        <SidebarMenu>
            <SidebarGroupLabel children={sidebarLabel} />
            {menuItems.map((item) =>
                item.items && item.items.length ? (
                    <div key={item.title}>
                        <Collapsible
                            defaultOpen={item.items.some(
                                (child) => child.url && pathname.startsWith(child.url)
                            )}
                        >
                            <CollapsibleTrigger
                                asChild
                                aria-activedescendant={
                                    item.items.some(
                                        (child) => child.url && pathname.startsWith(child.url)
                                    )
                                        ? "true"
                                        : "false"
                                }
                                className="w-full group group-data-[collapsible=icon]:hidden"
                            >
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        size="sm"
                                        className="w-full flex justify-between items-center aria-[activedescendant=true]:bg-accent/60"
                                    >
                                        {item.icon ? <item.icon /> : <span className="w-4 h-4" />}
                                        <span className="flex-1 text-left">{item.title}</span>
                                        {item.action && item.action}
                                        <SidebarMenuAction className="transition-transform duration-200 group-data-[state=open]:rotate-90 ml-auto">
                                            <ChevronRight />
                                        </SidebarMenuAction>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                                <SidebarMenuSub>
                                    {item.items.map((subItem) => (
                                        <SidebarMenuSubItem key={subItem.title}>
                                            <SidebarMenuSubButton
                                                asChild
                                                aria-activedescendant={
                                                    subItem.url && pathname.startsWith(subItem.url)
                                                        ? "true"
                                                        : "false"
                                                }
                                                className="aria-[activedescendant=true]:bg-accent/60"
                                            >
                                                <Link href={subItem.url}>
                                                    {subItem.icon ? (
                                                        <subItem.icon />
                                                    ) : (
                                                        <span className="w-4 h-4 inline-block" />
                                                    )}
                                                    <span>{subItem.title}</span>
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    ))}
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </Collapsible>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild className="w-full group group-data-[mobile=true]/sidebar-sheet:hidden">
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        size="sm"
                                        className="w-full flex justify-between items-center aria-[activedescendant=true]:bg-accent/60"
                                    >
                                        {item.icon ? <item.icon /> : <span className="w-4 h-4" />}
                                        <span className="flex-1 text-left">{item.title}</span>
                                        <SidebarMenuAction className="transition-transform duration-200 ml-auto">
                                            <ChevronRight />
                                        </SidebarMenuAction>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="right" className="overflow-hidden transition-all">
                                <DropdownMenuGroup>
                                    {item.items.map((subItem) => (
                                        <DropdownMenuItem
                                            asChild
                                            key={subItem.url || subItem.title}
                                            aria-activedescendant={
                                                subItem.url && pathname.startsWith(subItem.url)
                                                    ? "true"
                                                    : "false"
                                            }
                                            className="aria-[activedescendant=true]:bg-accent/60"
                                        >
                                            <Link href={subItem.url}>
                                                {subItem.icon ? (
                                                    <subItem.icon size={20} />
                                                ) : (
                                                    <span className="w-4 h-4" />
                                                )}
                                                <span>{subItem.title}</span>
                                            </Link>
                                            {item.action && item.action}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ) : (
                    <SidebarMenuItem key={item.url || item.title}>
                        <SidebarMenuButton
                            asChild
                            tooltip={item.title}
                            size="sm"
                            aria-activedescendant={
                                item.url && pathname.startsWith(item.url) ? "true" : "false"
                            }
                            className="aria-[activedescendant=true]:bg-accent/60"
                        >
                            {item.url ? (
                                <Link href={item.url}>
                                    {item.icon ? <item.icon /> : <span className="w-4 h-4" />}
                                    <span>{item.title}</span>
                                    {item.action && item.action}
                                </Link>
                            ) : (
                                <span className="flex items-center">
                                    {item.icon ? <item.icon /> : <span className="w-4 h-4" />}
                                    <span>{item.title}</span>
                                    {item.action && item.action}
                                </span>
                            )}
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                )
            )}
        </SidebarMenu>
    );
}
