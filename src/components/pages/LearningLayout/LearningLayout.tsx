import { ReactNode } from 'react'
import { Prisma } from '@prisma/client'
import { useFCMToken } from '@/hooks/useFCMToken'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/pages/LearningLayout/app-sidebar'
import { NavBreadcrumb } from '@/components/pages/LearningLayout/nav-breadcrumb'
import { Separator } from '@/components/ui/separator'

export type LearningLayoutProps = {
    children: ReactNode;
}

export type LearningLayoutCourseType = Prisma.CourseGetPayload<{
    include: {
        levels: {
            include: {
                materialItems: {
                    include: {
                        courseLevel: true,
                        systemForms: { include: { materialItem: { include: { courseLevel: true } }, items: { include: { questions: { include: { options: true } } } }, submissions: true } }
                    }
                },
                systemForms: { include: { materialItem: true, items: { include: { questions: { include: { options: true } } } }, submissions: true, courseLevel: true } },
                course: true,
                zoomGroups: true,
            },
        },
        systemForms: {
            include: {
                items: { include: { questions: { include: { options: true } } } },
                submissions: {
                    include: {
                        student: { include: { certificates: true } },
                        systemForm: { include: { materialItem: { include: { courseLevel: true } } } }
                    }
                },
                materialItem: true
            }
        },
        zoomGroups: { include: { zoomSessions: true, courseLevel: true } },
        placementTests: {
            include: {
                student: { include: { courseStatus: { include: { level: true } } } },
                tester: { include: { user: true } },
                writtenTest: { include: { items: { include: { questions: { include: { options: true } } } }, submissions: true } },
                course: { include: { levels: true } },
            }
        },
        courseStatus: { include: { user: { include: { orders: true } }, level: true } },
    },
}>

export type LearningLayoutLevelType = Prisma.CourseLevelGetPayload<{
    include: {
        zoomGroups: true,
        certificates: true,
        course: true,
        courseStatus: true,
        systemForms: { include: { items: { include: { questions: { include: { options: true } } } }, submissions: true } },
        materialItems: { include: { systemForms: { include: { items: { include: { questions: { include: { options: true } } } } } } } },
    },
}>

export type LearningLayoutUserType = Prisma.UserGetPayload<{
    include: {
        orders: { include: { product: { include: { productItems: { include: { course: { include: { levels: true, orders: { include: { user: true } } } } } } } } } },
        systemFormSubmissions: true,
        zoomGroups: { include: { zoomSessions: true, teacher: { include: { user: true } }, course: true, students: true, courseLevel: true }, },
        placementTests: {
            include: {
                tester: { include: { user: true } },
                course: { include: { levels: true } },
                student: { include: { courseStatus: { include: { level: true } } } },
                writtenTest: { include: { submissions: true } }
            }
        },
        studentNotes: { include: { createdByUser: true, mentions: true } },
        courseStatus: { include: { level: true } },
        certificates: { include: { course: true, courseLevel: true } },
    },
}>

const LearningLayout = ({ children }: LearningLayoutProps) => {
    useFCMToken()

    return (
        <SidebarProvider>
            <style>{`body { overflow-x: auto !important; overflow-y: auto !important; }`}</style>
            <AppSidebar variant='inset' />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <NavBreadcrumb />
                    </div>
                </header>
                <div className="p-4">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    )
}

export default LearningLayout