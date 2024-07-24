import { ReactNode, useEffect } from 'react'
import { Sheet, SheetContent } from '../ui/sheet'
import { useNavStore } from '@/zustand/store'
import { LearningNavigationMenu } from './LearningNavigationMenu'
import LearningDrawer from './LearningDrawer'
import ChatWithUs from '../landingPageComponents/ChatWithUs'
import LearningFooter from './LearningFooter'
import { useRouter } from 'next/router'
import { api } from '@/lib/api'
import { Prisma } from '@prisma/client'
import Spinner from '@/components/Spinner'
import useLoadLearningData from '@/hooks/useLoadLearningData'

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
                        evaluationForms: { include: { materialItem: { include: { courseLevel: true } }, questions: true, submissions: true } }
                    }
                },
                evaluationForms: { include: { materialItem: true, questions: true, submissions: true, courseLevel: true } },
                course: true,
                zoomGroups: true,
            },
        },
        evaluationForms: {
            include: {
                questions: true,
                submissions: {
                    include: {
                        student: { include: { certificates: true } },
                        evaluationForm: { include: { materialItem: { include: { courseLevel: true } } } }
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
                trainer: { include: { user: true } },
                oralTestTime: true,
                writtenTest: { include: { questions: true, submissions: true } },
                course: { include: { levels: true } },
            }
        },
        courseStatus: { include: { user: { include: { orders: true } }, level: true } }
    },
}>

export type LearningLayoutLevelType = Prisma.CourseLevelGetPayload<{
    include: {
        zoomGroups: true,
        certificates: true,
        course: true,
        courseStatus: true,
        evaluationForms: { include: { questions: true, submissions: true } },
        materialItems: { include: { evaluationForms: true } },
    },
}>

export type LearningLayoutUserType = Prisma.UserGetPayload<{
    include: {
        orders: { include: { courses: { include: { levels: true, orders: { include: { user: true } } } } } },
        evaluationFormSubmissions: true,
        zoomGroups: { include: { zoomSessions: true, trainer: { include: { user: true } }, course: true, students: true, courseLevel: true }, },
        placementTests: {
            include: {
                trainer: { include: { user: true } },
                course: { include: { levels: true } },
                student: { include: { courseStatus: { include: { level: true } } } },
                oralTestTime: true,
                writtenTest: { include: { submissions: true } }
            }
        },
        studentNotes: { include: { createdByUser: true, mentions: true } },
        courseStatus: { include: { level: true } },
        certificates: { include: { course: true, courseLevel: true } },
    },
}>

const LearningLayout = ({ children }: LearningLayoutProps) => {
    const { opened, openNav, closeNav } = useNavStore();

    const { course, level, user } = useLoadLearningData()

    if (!course || !user) return null

    return (
        <div className="flex">
            <Sheet
                open={opened}
                onOpenChange={() => opened ? closeNav() : openNav()}
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
                    <LearningFooter course={course} level={!level ? undefined : level} />
                </div>
            </div>
        </div>
    )
}

export default LearningLayout