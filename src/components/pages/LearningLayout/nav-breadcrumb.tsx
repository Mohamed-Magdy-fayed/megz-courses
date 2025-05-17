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
import { useRouter } from "next/router"
import { api } from "@/lib/api"

export function NavBreadcrumb() {
    const router = useRouter()
    const slug = router.query.courseSlug as string;
    const levelSlug = router.query.levelSlug as string;

    const { data: course } = api.courses.getBySlugSimple.useQuery({ slug }, { enabled: !!slug })
    const levelId = course?.levels?.find(level => level.slug === levelSlug)?.id
    const { data: level } = api.levels.getByIdSimple.useQuery({ id: levelId! }, { enabled: !!levelId })
    const { data: materialItems } = api.materials.getBycourseLevelId.useQuery({ courseLevelId: levelId! }, { enabled: !!levelId })

    const [open, setOpen] = React.useState(false)

    // Memoized maps for O(1) lookups
    const materialSlugMap = React.useMemo(() => {
        const map = new Map();
        materialItems?.forEach(item => map.set(item.slug, item));
        return map;
    }, [materialItems]);
    const systemFormIdMap = React.useMemo(() => {
        const map = new Map();
        materialItems?.forEach((item, idx) => {
            item.systemForms?.forEach(form => map.set(form.id, idx));
        });
        return map;
    }, [materialItems]);

    const pathname = usePathname();
    const pathSegments = React.useMemo(() => pathname?.split('/').filter(seg => !["student", "admin"].includes(seg)), [pathname]);

    // Memoized breadcrumb data for performance
    const breadcrumbData = React.useMemo(() => {
        if (!Array.isArray(pathSegments) || pathSegments.length === 0) return [];
        const items = pathSegments.filter((_, i) => i !== 4);
        return items.map((segment, index) => {
            let label = "";
            if (segment === "") label = "Home";
            else if (segment === "my_courses") label = "My Courses";
            else if (index === 2) label = course?.name || "";
            else if (index === 3) label = level?.name || "";
            else if (index === 4 && pathSegments[4] === "Quiz") {
                const idx = systemFormIdMap.get(pathSegments[pathSegments.length - 1]);
                label = idx !== undefined ? `Session ${idx + 1} Quiz` : "Quiz";
            } else if (index === 4 && pathSegments[4] === "Assignment") {
                const idx = systemFormIdMap.get(pathSegments[pathSegments.length - 1]);
                label = idx !== undefined ? `Session ${idx + 1} Assignment` : "Assignment";
            } else if (index === 4 && pathSegments[4] === "session") {
                const session = materialSlugMap.get(pathSegments[pathSegments.length - 1]);
                label = session ? `Session: ${session.title}` : "Session";
            } else if (index === 4 && pathSegments[4] === "final_test") label = `Final Test`;
            else if (index === 4 && pathSegments[4] === "certificate") label = "Certificate";
            const href = index === 0 ? "/" : index === 4 ? undefined : (index === 3 && index === pathSegments.length - 1) ? undefined : pathSegments.slice(0, index + 1).join('/');
            return { label, href };
        }).filter(item => item.label);
    }, [pathSegments, course, level, materialSlugMap, systemFormIdMap]);

    // Defensive: don't render if no breadcrumbData
    if (!breadcrumbData || breadcrumbData.length === 0) return null

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbData[0]?.label && (
                    <BreadcrumbItem>
                        <BreadcrumbLink href={breadcrumbData[0]?.href}>{breadcrumbData[0]?.label}</BreadcrumbLink>
                    </BreadcrumbItem>
                )}
                {breadcrumbData.length > 1 && <BreadcrumbSeparator />}
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
                                            {item.href ? (
                                                <Link href={`/student${item.href}`}>
                                                    {item.label}
                                                </Link>
                                            ) : (
                                                <span>{item.label}</span>
                                            )}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                    </>
                ) : null}
                {breadcrumbData.slice(-2).map((item, index, arr) => (
                    <React.Fragment key={item.href || item.label || index}>
                        <BreadcrumbItem>
                            {item.href ? (
                                <BreadcrumbLink
                                    asChild
                                    className="max-w-20 truncate md:max-w-none"
                                >
                                    <Link href={`/student${item.href}`}>{item.label}</Link>
                                </BreadcrumbLink>
                            ) : (
                                <BreadcrumbPage className="max-w-20 truncate md:max-w-none">
                                    {item.label}
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
