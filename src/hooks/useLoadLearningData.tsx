import { useRouter } from 'next/router';
import { api } from '@/lib/api';

const useLoadLearningData = () => {
    const router = useRouter()
    const courseSlug = router.query.courseSlug as string
    const levelSlug = router.query.levelSlug as string

    const userQuery = api.users.getCurrentUser.useQuery(undefined, {
        enabled: !!courseSlug ? true : false,
    })
    const courseQuery = api.courses.getBySlug.useQuery({ slug: courseSlug }, {
        enabled: !!courseSlug ? true : false,
    })
    const levelQuery = api.levels.getBySlug.useQuery({ slug: levelSlug }, {
        enabled: courseSlug && levelSlug ? true : false,
    })
    const user = userQuery.data?.user
    const course = courseQuery.data?.course
    const level = levelQuery.data?.level
    const levelSlugs = user?.courseStatus.filter((status) => status.courseId === course?.id).map(item => item.level?.slug);

    return {
        user: !user ? undefined : user,
        course: !course ? undefined : course,
        level: !level ? undefined : level,
        levelSlugs: !levelSlugs ? undefined : levelSlugs,
    }
};

export default useLoadLearningData;
