import { useRouter } from 'next/router';
import { api } from '@/lib/api';

const useLoadLearningData = () => {
    const router = useRouter();
    const courseSlug = router.query.courseSlug as string;
    const levelSlug = router.query.levelSlug as string;

    const hasCourseSlug = !!courseSlug;
    const hasLevelSlug = !!levelSlug;

    const userQuery = api.users.getCurrentUser.useQuery(undefined, {
        enabled: hasCourseSlug,
    });

    const courseQuery = api.courses.getBySlug.useQuery({ slug: courseSlug }, {
        enabled: hasCourseSlug,
    });

    const levelQuery = api.levels.getBySlug.useQuery(
        { slug: levelSlug, courseSlug },
        { enabled: hasCourseSlug && hasLevelSlug }
    );

    const user = userQuery.data?.user;
    const course = courseQuery.data?.course;
    const level = hasLevelSlug ? levelQuery.data?.level : undefined;

    const levelSlugs = user?.courseStatus
        .filter((status) => status.courseId === course?.id)
        .map((item) => item.level?.slug);

    const isLoading =
        userQuery.isLoading || courseQuery.isLoading || (hasLevelSlug && levelQuery.isLoading);

    const error =
        userQuery.error || courseQuery.error || (hasLevelSlug ? levelQuery.error : null);

    const isError =
        userQuery.isError || courseQuery.isError || (hasLevelSlug && levelQuery.isError);

    return {
        user: user ?? undefined,
        course: course ?? undefined,
        level,
        levelSlugs: levelSlugs ?? undefined,
        isLoading,
        error,
        isError,
    };
};

export default useLoadLearningData;
