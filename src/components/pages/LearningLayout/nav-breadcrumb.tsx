"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/router"

import {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function NavBreadcrumb() {
    const [open, setOpen] = React.useState(false)

    const { asPath } = useRouter();
    const pathSegments = React.useMemo(() => asPath.split('/'), [asPath]);
    const filteredPathSegments = React.useMemo(() => pathSegments.filter(seg => !["student", "admin"].includes(seg)), [pathSegments]);

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {filteredPathSegments[0] === "" && (
                    <BreadcrumbItem>
                        <BreadcrumbLink className="hover:text-primary" href={`/`}>Home</BreadcrumbLink>
                    </BreadcrumbItem>
                )}
                {filteredPathSegments.length > 1 && <BreadcrumbSeparator />}
                {filteredPathSegments.length > 3 ? (
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
                                    {filteredPathSegments.slice(1, -2)
                                        .filter(seg => !["student", "admin"].includes(seg))
                                        .map((item, index) => (
                                            <DropdownMenuItem key={`${index}_${item}`}>
                                                <Link href={`${asPath.split(item)[0]}${item}`}>
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
                {filteredPathSegments.slice(-2).map((item, index, arr) => (
                    <React.Fragment key={`${index}_${item}`}>
                        <BreadcrumbItem>
                            {!["student", "admin"].includes(item) ? (
                                <BreadcrumbLink
                                    asChild
                                    className="max-w-20 truncate md:max-w-none hover:text-primary"
                                >
                                    <Link href={`${asPath.split(item)[0]}${item}`}>{item}</Link>
                                </BreadcrumbLink>
                            ) : (
                                <BreadcrumbPage className="max-w-20 truncate md:max-w-none">
                                    {item}
                                </BreadcrumbPage>
                            )}
                        </BreadcrumbItem>
                        {index < arr.length - 1 && <BreadcrumbSeparator />}
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
