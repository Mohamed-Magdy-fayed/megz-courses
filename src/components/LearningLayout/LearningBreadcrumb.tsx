"use client"

import * as React from "react"
import Link from "next/link"

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
import { usePathname } from "next/navigation"
import { LearningLayoutCourseType, LearningLayoutLevelType } from "@/components/LearningLayout/LearningLayout"

export function LearningBreadcrumb({ level, course }: {
    level: LearningLayoutLevelType;
    course: LearningLayoutCourseType;
}) {
    const [open, setOpen] = React.useState(false)
    const [breadcrumbData, setBreadcrumbData] = React.useState<{ label: string, href: string | undefined }[]>([])
    const pathname = usePathname()
    const pathSegments = pathname.split('/')

    const getBreadcrumbLabel = (segment: string, index: number) => {
        if (segment === "") return "Home"
        if (segment === "my_courses") return "My Courses"
        if (index === 2) return course.name
        if (index === 3) return level.name
        if (index === 4 && pathSegments[4] === "quiz") return `Session ${level.materialItems.findIndex(({ evaluationForms }) => evaluationForms.find(({ id }) => id === pathSegments[pathSegments.length - 1])?.id) + 1} Quiz`
        if (index === 4 && pathSegments[4] === "assignment") return `Session ${level.materialItems.findIndex(({ evaluationForms }) => evaluationForms.find(({ id }) => id === pathSegments[pathSegments.length - 1])?.id) + 1} Assignment`
        if (index === 4 && pathSegments[4] === "session") return `Session: ${level.materialItems.find(({ slug }) => slug === pathSegments[pathSegments.length - 1])?.title || "no title"}`
        if (index === 4 && pathSegments[4] === "final_test") return `Final Test`
        if (index === 4 && pathSegments[4] === "certificate") return `Certificate`
        return ""
    }

    const processBreadcrumbData = () => {
        const items = pathSegments.filter((_, i) => i !== 5)
        console.log(pathSegments);
        
        const data = items.map((segment, index) => {
            const href = index === 0 ? "/" : index === 4 ? undefined : (index === 3 && index === pathSegments.length - 1) ? undefined : pathSegments.slice(0, index + 1).join('/');
            const label = getBreadcrumbLabel(segment, index)

            return {
                label,
                href,
            };
        })
        console.log(data);

        setBreadcrumbData(data)
    }

    React.useEffect(() => {
        processBreadcrumbData()
    }, [])

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href={breadcrumbData[0]?.href}>{breadcrumbData[0]?.label}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                {breadcrumbData.length > 3 ? (
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
                                    {breadcrumbData.slice(1, -2).map((item, index) => (
                                        <DropdownMenuItem key={index}>
                                            <Link href={item.href ? item.href : "#"}>
                                                {item.label}
                                            </Link>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                    </>
                ) : null}
                {breadcrumbData.slice(-3 + 1).map((item, index) => (
                    <div key={index} className="flex items-center">
                        <BreadcrumbItem>
                            {item.href ? (
                                <BreadcrumbLink
                                    asChild
                                    className="max-w-20 truncate md:max-w-none"
                                >
                                    <Link href={item.href}>{item.label}</Link>
                                </BreadcrumbLink>
                            ) : (
                                <BreadcrumbPage className="max-w-20 truncate md:max-w-none">
                                    {item.label}
                                </BreadcrumbPage>
                            )}
                        </BreadcrumbItem>
                        {item.href && <BreadcrumbSeparator />}
                    </div>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
