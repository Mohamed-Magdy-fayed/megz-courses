"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { LogoPrimary } from "@/components/pages/adminLayout/Logo"
import { Typography } from "@/components/ui/Typoghraphy"
import { api } from "@/lib/api"

export function SidebarLogo() {
    const { data } = api.siteIdentity.getSiteIdentity.useQuery()

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <Link href={'/'} className="flex items-center gap-1 justify-center w-full">
                    <SidebarMenuButton
                        tooltip="Home"
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                        {data?.siteIdentity ? (
                            <Image src={data?.siteIdentity.logoForeground} height={1000} width={1000} alt="Logo" className='w-8 rounded-full' />
                        ) : (
                            <LogoPrimary className="w-8 h-8" />
                        )}
                        <Typography variant={"primary"} className="!text-lg !leading-none !font-extrabold text-primary">
                            {data?.siteIdentity?.name1 || "Gateling"}
                        </Typography>
                        <Typography variant={"primary"} className="!text-lg !leading-none !font-extrabold text-primary">
                            {data?.siteIdentity?.name2 || "TMS"}
                        </Typography>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
