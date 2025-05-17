"use client"

import React from "react"
import { ChevronRight, type LucideIcon } from "lucide-react"

import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "@/components/ui/sidebar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"

export function NavMain({
    items,
}: {
    items: {
        title: string
        url?: string
        icon?: LucideIcon
        isActive?: boolean
        items?: {
            title: string
            url: string
        }[]
    }[]
}) {
    const [activeItem, setActiveItem] = React.useState<string | undefined>(items.find(item => item.isActive)?.title)

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Levels</SidebarGroupLabel>
            <SidebarMenu>
                <Accordion type="single" collapsible className="w-full" value={activeItem} onValueChange={setActiveItem}>
                    {items.map((item) => (
                        <SidebarMenuItem
                            key={item.title}
                        >
                            <AccordionItem
                                value={item.title}
                                className="group/collapsible border-0"
                            >
                                <AccordionTrigger removeIcon className="hover:no-underline">
                                    <SidebarMenuButton tooltip={item.title} className="py-6 text-ellipsis">
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <SidebarMenuSub>
                                        {item.items?.map((subItem) => (
                                            <SidebarMenuSubItem key={subItem.title}>
                                                <SidebarMenuSubButton asChild>
                                                    <Link href={subItem.url}>
                                                        <span>{subItem.title}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </AccordionContent>
                            </AccordionItem>
                        </SidebarMenuItem>
                    ))}
                </Accordion>
            </SidebarMenu>
        </SidebarGroup>
    )
}
