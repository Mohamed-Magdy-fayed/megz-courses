import Spinner from '@/components/Spinner'
import CoursesClient from '@/components/courses/CoursesClient'
import AppLayout from '@/components/layout/AppLayout'
import { ConceptTitle } from '@/components/ui/Typoghraphy'
import { useRouter } from 'next/router'

const CoursePage = () => {
    const router = useRouter()
    const id = router.query.courseId

    return (
        <AppLayout>
            {!id || typeof id !== "string" ? (
                <div className='w-full h-full grid place-content-center'>
                    <Spinner />
                </div>
            ) : (
                <div>
                    <ConceptTitle>My Courses</ConceptTitle>
                    <CoursesClient userId={id} />
                </div>
            )}
        </AppLayout>
    )
}

export default CoursePage