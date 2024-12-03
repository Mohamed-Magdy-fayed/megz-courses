import { api } from "@/lib/api"
import { SystemFormTypes } from "@prisma/client"

type UseEvalformSubmissionProps = {
    courseSlug: string;
    formType: SystemFormTypes;
    levelSlug?: string;
    materialItemSlug?: string;
    enabled?: boolean;
}

export const useEvalformSubmission = ({ courseSlug, formType, levelSlug, materialItemSlug, enabled }: UseEvalformSubmissionProps) => {
    const { data: userSubmissionData, isLoading } = api.systemFormSubmissions.getUserSubmissionDetails.useQuery({
        courseSlug, levelSlug, materialItemSlug, formType
    }, { enabled })

    return {
        submittedAlready: userSubmissionData?.isSubmitted,
        systemForm: userSubmissionData?.systemForm,
        systemSubmission: userSubmissionData?.submission,
        totalScore: userSubmissionData?.systemForm?.totalScore,
        isLoading,
        error: userSubmissionData?.error,
    }
}