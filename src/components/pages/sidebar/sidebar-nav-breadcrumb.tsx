"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/router"

import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function SidebarNavBreadCrumb() {
    const [open, setOpen] = React.useState(false)

    const { pathname } = useRouter()
    const pathSegments = React.useMemo(() => pathname.split('/'), [pathname]);

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {pathSegments[0] === "" && (
                    <BreadcrumbItem>
                        <BreadcrumbLink className="hover:text-primary" href={`/`}>Home</BreadcrumbLink>
                    </BreadcrumbItem>
                )}
                {pathSegments.length > 1 && <BreadcrumbSeparator />}
                {pathSegments.length > 3 ? (
                    <>
                        <BreadcrumbItem>
                            <DropdownMenu open={open} onOpenChange={setOpen}>
                                <DropdownMenuTrigger
                                    className="flex items-center gap-1"
                                    aria-label="Toggle menu"
                                >
                                    <BreadcrumbEllipsis className="h-4 w-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    {pathSegments.slice(1, -2)
                                        .map((item, index) => (
                                            <DropdownMenuItem key={`${index}_${item}`}>
                                                <Link href={`${pathname.split(item)[0]}${item}`}>
                                                    {item}
                                                </Link>
                                            </DropdownMenuItem>
                                        ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                    </>
                ) : null}
                {pathSegments.slice(-2).map((item, index, arr) => (
                    <React.Fragment key={`${index}_${item}`}>
                        <BreadcrumbItem>
                            {index === arr.length - 1 ? (
                                <BreadcrumbPage className="max-w-20 truncate md:max-w-none text-primary">
                                    {item}
                                </BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink
                                    asChild
                                    className="max-w-20 truncate md:max-w-none hover:text-primary"
                                >
                                    <Link href={`${pathname.split(item)[0]}${item}`}>{item}</Link>
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                        {index < arr.length - 1 && <BreadcrumbSeparator />}
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
