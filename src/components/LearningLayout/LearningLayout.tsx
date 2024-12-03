import { ReactNode, useEffect } from 'react'
import { Sheet, SheetContent } from '../ui/sheet'
import { useNavStore } from '@/zustand/store'
import { LearningNavigationMenu } from './LearningNavigationMenu'
import LearningDrawer from './LearningDrawer'
import ChatWithUs from '../landingPageComponents/ChatWithUs'
import LearningFooter from './LearningFooter'
import { Prisma } from '@prisma/client'
import useLoadLearningData from '@/hooks/useLoadLearningData'
import { api } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'

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
        orders: { include: { user: true } },
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
        orders: { include: { course: { include: { levels: true, orders: { include: { user: true } } } } } },
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
    const { Opened, openNav, closeNav } = useNavStore();

    const { course, level, user } = useLoadLearningData()
    const { data, refetch } = api.siteIdentity.getSiteIdentity.useQuery(undefined, { enabled: false })

    useEffect(() => { refetch() }, [])

    if (!course || !user) return (
        <div className="flex">
            <Sheet
                open={Opened}
                onOpenChange={() => Opened ? closeNav() : openNav()}
            >
                <SheetContent side="left" className="p-0 w-min">
                    <Skeleton className='w-40 h-80 rounded-none bg-foreground' />
                </SheetContent>
            </Sheet>
            <div className="hidden lg:block p-0 w-min">
                <Skeleton className='w-80 h-full rounded-none bg-foreground' />
            </div>
            <div className="w-full h-screen flex flex-col">
                <LearningNavigationMenu />
                <div className="flex flex-col justify-between flex-grow overflow-auto transition-all scrollbar-thin scrollbar-track-accent scrollbar-thumb-secondary">
                    <main className="p-4">{children}</main>
                    <ChatWithUs />
                </div>
                <Skeleton className='w-full h-20 rounded-none bg-foreground' />
            </div>
        </div>
    )

    return (
        <div className="flex">
            <Sheet
                open={Opened}
                onOpenChange={() => Opened ? closeNav() : openNav()}
            >
                <SheetContent side="left" className="p-0 w-min">
                    <LearningDrawer user={user} course={course} level={!level ? undefined : level} />
                </SheetContent>
            </Sheet>
            <div className="hidden lg:block p-0 w-min">
                <LearningDrawer user={user} course={course} level={!level ? undefined : level} />
            </div>
            <div className="w-full h-screen flex flex-col">
                <LearningNavigationMenu />
                <div className="flex flex-col justify-between flex-grow overflow-auto transition-all scrollbar-thin scrollbar-track-accent scrollbar-thumb-secondary">
                    <main className="p-4">{children}</main>
                    <ChatWithUs />
                    <LearningFooter siteIdentity={data?.siteIdentity} course={course} level={!level ? undefined : level} />
                </div>
            </div>
        </div>
    )
}

export default LearningLayout