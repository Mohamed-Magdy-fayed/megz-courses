"use client"

import * as React from "react"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LogoPrimary } from "@/components/pages/adminLayout/Logo"
import { Typography } from "@/components/ui/Typoghraphy"
import { SiteIdentity } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"

export function NavLogo({ siteIdentity }: { siteIdentity?: SiteIdentity }) {

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                    <Link href={'/'} className="flex items-center gap-1 justify-center w-fit">
                        {siteIdentity ? (
                            <Image src={siteIdentity.logoForeground} height={1000} width={1000} alt="Logo" className='w-12 rounded-full' />
                        ) : (
                            <LogoPrimary className="w-12 h-12" />
                        )}
                        <Typography variant={"primary"} className="!text-lg !leading-none !font-extrabold text-primary">
                            {siteIdentity?.name1 || "Gateling"}
                        </Typography>
                        <Typography variant={"primary"} className="!text-lg !leading-none !font-extrabold text-primary">
                            {siteIdentity?.name2 || "TMS"}
                        </Typography>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
