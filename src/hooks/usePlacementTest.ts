import { api } from "@/lib/api";

export const usePlacementTest = (slug: string) => {
    const { data: courseData, isLoading: isCourseLoading } = api.courses.getBySlug.useQuery({ slug }, { enabled: !!slug });
    const { data: scheduleData, isLoading: isTestLoading } = api.placementTests.getUserCoursePlacementTest.useQuery({ courseSlug: slug }, { enabled: !!courseData?.course?.id });

    return { courseData, scheduleData, isLoading: isCourseLoading || isTestLoading };
};