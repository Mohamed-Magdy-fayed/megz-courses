import Spinner from '@/components/Spinner'
import CoursesClient from '@/components/courses/CoursesClient'
import LandingLayout from '@/components/landingPageComponents/LandingLayout'
import { ConceptTitle } from '@/components/ui/Typoghraphy'
import { useRouter } from 'next/router'

const CoursePage = () => {
    const router = useRouter()
    const id = router.query.userId

    return (
        <LandingLayout>
            {!id || typeof id !== "string" ? (
                <div className='w-full h-full grid place-content-center'>
                    <Spinner />
                </div>
            ) : (
                <div className='p-4 lg:px-8'>
                    <ConceptTitle>My Courses</ConceptTitle>
                    <CoursesClient userId={id} />
                </div>
            )}
        </LandingLayout>
    )
}

export default CoursePage