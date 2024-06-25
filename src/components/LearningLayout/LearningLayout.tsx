import { ReactNode, useEffect } from 'react'
import { Sheet, SheetContent } from '../ui/sheet'
import { api } from '@/lib/api'
import { useNavStore } from '@/zustand/store'
import { useSession } from 'next-auth/react'
import Spinner from '../Spinner'
import { LearningNavigationMenu } from './LearningNavigationMenu'
import LearningDrawer from './LearningDrawer'
import ChatWithUs from '../landingPageComponents/ChatWithUs'
import LearningFooter from './LearningFooter'
import { useRouter } from 'next/router'

type LearningLayoutProps = {
    children: ReactNode,
}

const LearningLayout = ({ children }: LearningLayoutProps) => {
    const { opened, openNav, closeNav } = useNavStore();
    const router = useRouter()
    const id = router.query.courseId as string

    const { data: session, status } = useSession({ required: true })
    const mutation = api.zoomGroups.zoomGroupsCronJob.useMutation()
    const courseQuery = api.courses.getById.useQuery({ id })
    const trpcUtils = api.useContext()

    useEffect(() => {
        mutation.mutate(undefined, { onSettled: () => trpcUtils.invalidate() })
    }, [new Date().getMinutes()])

    if (status === "loading" || !session.user || !courseQuery.data?.course) return (
        <div className="grid place-content-center w-screen h-screen">
            <Spinner />
        </div>
    )

    return (
        <div className="flex">
            <Sheet
                open={opened}
                onOpenChange={() => opened ? closeNav() : openNav()}
            >
                <SheetContent side="left" className="p-0 w-min">
                    <LearningDrawer course={courseQuery.data.course} />
                </SheetContent>
            </Sheet>
            <div className="hidden lg:block p-0 w-min">
                <LearningDrawer course={courseQuery.data.course} />
            </div>
            <div className="w-full h-screen flex flex-col">
                <LearningNavigationMenu />
                <div className="flex flex-col justify-between flex-grow overflow-auto transition-all scrollbar-thin scrollbar-track-accent scrollbar-thumb-secondary">
                    <main className="p-4">{children}</main>
                    <ChatWithUs />
                    <LearningFooter course={courseQuery.data.course} />
                </div>
            </div>
        </div>
    )
}

export default LearningLayout