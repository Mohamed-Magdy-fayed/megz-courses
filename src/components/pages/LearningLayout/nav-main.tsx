"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChevronRight, type LucideIcon } from "lucide-react";

import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuAction, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, SidebarGroupLabel } from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import WrapWithTooltip from "@/components/ui/wrap-with-tooltip";

export type NavMainItem = {
    title: string;
    url?: string;
    icon?: LucideIcon;
    action?: React.ReactNode;
    isActive?: boolean;
    items?: NavMainItem[];
};

type NavMainProps = {
    sidebarLabel?: string;
    items: NavMainItem[];
};


function renderSidebarItems(items: NavMainItem[], pathname: string) {
    return items.map((item) =>
        item.items && item.items.length ? (
            <Collapsible
                key={item.title}
                defaultOpen={item.items.some(
                    (child) => child.url && pathname.startsWith(child.url!)
                )}
            >
                <CollapsibleTrigger
                    asChild
                    aria-activedescendant={
                        item.items.some(
                            (child) => child.url && pathname.startsWith(child.url!)
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
                            className="w-full flex items-center aria-[activedescendant=true]:bg-accent/60"
                        >
                            {item.icon ? <item.icon /> : null}
                            <WrapWithTooltip delay={2000} text={item.title}>
                                <span className="text-left truncate">{item.title}</span>
                            </WrapWithTooltip>
                            {item.action && item.action}
                            <SidebarMenuAction asChild className="transition-transform duration-200 group-data-[state=open]:rotate-90 ml-auto">
                                <ChevronRight />
                            </SidebarMenuAction>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </CollapsibleTrigger>
                <CollapsibleContent
                    onAnimationStart={e => {
                        e.currentTarget.style.overflowY = "hidden";
                    }}
                    onAnimationEnd={e => {
                        e.currentTarget.style.overflowY = e.currentTarget.dataset.state === "open" ? "visible" : "hidden";
                    }}
                    className="overflow-y-visible transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down"
                >
                    <SidebarMenuSub>
                        {renderSidebarItems(item.items, pathname)}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
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
                            {item.icon ? <item.icon /> : null}
                            <WrapWithTooltip delay={2000} text={item.title}>
                                <span className="truncate">{item.title}</span>
                            </WrapWithTooltip>
                            {item.action && item.action}
                        </Link>
                    ) : (
                        <span className="flex items-center">
                            {item.icon ? <item.icon /> : null}
                            <WrapWithTooltip delay={2000} text={item.title}>
                                <span className="truncate">{item.title}</span>
                            </WrapWithTooltip>
                            {item.action && item.action}
                        </span>
                    )}
                </SidebarMenuButton>
            </SidebarMenuItem>
        )
    );
}

function renderDropdownMenuForItem(item: NavMainItem, pathname: string) {
    if (item.items && item.items.length) {
        return (
            <DropdownMenu key={item.title}>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="sm" tooltip={item.title}>
                            {item.icon ? <item.icon size={20} /> : null}
                            <WrapWithTooltip delay={2000} text={item.title}>
                                <span>{item.title}</span>
                            </WrapWithTooltip>
                            <SidebarMenuAction asChild className="transition-transform duration-200 ml-auto">
                                <ChevronRight />
                            </SidebarMenuAction>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right">
                    <DropdownMenuGroup>
                        {item.items.map((child) =>
                            child.items && child.items.length ? (
                                <DropdownMenuSub key={child.title}>
                                    <DropdownMenuSubTrigger className="w-full">
                                        {child.icon ? <child.icon size={20} /> : null}
                                        <WrapWithTooltip delay={2000} text={child.title}>
                                            <span className="flex-1 text-left">{child.title}</span>
                                        </WrapWithTooltip>
                                        {child.action && child.action}
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                        <DropdownMenuGroup>
                                            {child.items.map((subChild) => (
                                                <DropdownMenuItem
                                                    key={subChild.url || subChild.title}
                                                    aria-activedescendant={
                                                        subChild.url && pathname.startsWith(subChild.url) ? "true" : "false"
                                                    }
                                                    asChild
                                                    className="aria-[activedescendant=true]:bg-accent/60"
                                                >
                                                    {subChild.url ? (
                                                        <Link href={subChild.url}>
                                                            {subChild.icon ? <subChild.icon size={20} /> : null}
                                                            <WrapWithTooltip delay={2000} text={subChild.title}>
                                                                <span>{subChild.title}</span>
                                                            </WrapWithTooltip>
                                                            {subChild.action && subChild.action}
                                                        </Link>
                                                    ) : (
                                                        <span className="flex items-center">
                                                            {subChild.icon ? <subChild.icon size={20} /> : null}
                                                            <WrapWithTooltip delay={2000} text={subChild.title}>
                                                                <span>{subChild.title}</span>
                                                            </WrapWithTooltip>
                                                            {subChild.action && subChild.action}
                                                        </span>
                                                    )}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuGroup>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                            ) : (
                                <DropdownMenuItem
                                    key={child.url || child.title}
                                    asChild
                                    aria-activedescendant={
                                        child.url && pathname.startsWith(child.url) ? "true" : "false"
                                    }
                                    className="aria-[activedescendant=true]:bg-accent/60"
                                >
                                    {child.url ? (
                                        <Link href={child.url}>
                                            {child.icon ? <child.icon size={20} /> : null}
                                            <WrapWithTooltip delay={2000} text={child.title}>
                                                <span>{child.title}</span>
                                            </WrapWithTooltip>
                                            {child.action && child.action}
                                        </Link>
                                    ) : (
                                        <span className="flex items-center">
                                            {child.icon ? <child.icon size={20} /> : null}
                                            <WrapWithTooltip delay={2000} text={child.title}>
                                                <span>{child.title}</span>
                                            </WrapWithTooltip>
                                            {child.action && child.action}
                                        </span>
                                    )}
                                </DropdownMenuItem>
                            )
                        )}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    } else {
        // No children, just a single item
        return (
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
                            {item.icon ? <item.icon size={20} /> : null}
                            <WrapWithTooltip delay={2000} text={item.title}>
                                <span>{item.title}</span>
                            </WrapWithTooltip>
                            {item.action && item.action}
                        </Link>
                    ) : (
                        <span className="flex items-center">
                            {item.icon ? <item.icon size={20} /> : null}
                            <WrapWithTooltip delay={2000} text={item.title}>
                                <span>{item.title}</span>
                            </WrapWithTooltip>
                            {item.action && item.action}
                        </span>
                    )}
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    }
}

export function NavMain({ items, sidebarLabel }: NavMainProps) {
    const { pathname } = useRouter();
    const menuItems = useMemo(() => items, [items]);

    return (
        <SidebarMenu>
            <SidebarGroupLabel>{sidebarLabel}</SidebarGroupLabel>
            {/* Sidebar (Collapsible) */}
            <div className="group-data-[collapsible=icon]:hidden">
                {renderSidebarItems(menuItems, pathname)}
            </div>
            {/* Dropdown (Collapsed/rail) */}
            <div className="hidden group-data-[collapsible=icon]:block">
                {menuItems.map((item) => renderDropdownMenuForItem(item, pathname))}
            </div>
        </SidebarMenu>
    );
}
