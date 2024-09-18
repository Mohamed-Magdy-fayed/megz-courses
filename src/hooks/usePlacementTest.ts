import { api } from "@/lib/api";
import { useSession } from "next-auth/react";

export const usePlacementTest = (slug: string) => {
    const session = useSession();
    const userId = session.data?.user.id;
    const trpcUtils = api.useContext();

    const { data: courseData } = api.courses.getBySlug.useQuery({ slug }, { enabled: !!slug && !!userId });
    const { data: submissionsData } = api.evaluationFormSubmissions.getEvalFormSubmission.useQuery(undefined, { enabled: !!userId });
    const { data: scheduleData } = api.placementTests.getUserCoursePlacementTest.useQuery({ courseId: courseData?.course?.id! }, { enabled: !!courseData?.course?.id && !!userId });

    return { courseData, submissionsData, scheduleData, session, userId, trpcUtils };
};