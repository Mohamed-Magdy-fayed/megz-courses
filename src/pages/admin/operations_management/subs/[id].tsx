import LandingLayout from "@/components/landingPageComponents/LandingLayout"
import Spinner from "@/components/Spinner"
import SystemFormCard from "@/components/systemForms/SystemFormCard"
import { api } from "@/lib/api"
import { useRouter } from "next/router"

export default function SubmissionPage() {
    const router = useRouter()
    const id = router.query.id as string
    const { data } = api.systemFormSubmissions.getSubmissionDetails.useQuery({ id }, { enabled: !!id })

    if (!data?.submission) return (
        <LandingLayout>
            <Spinner />
        </LandingLayout>
    )

    return (
        <LandingLayout>
            <SystemFormCard isSubmissionView submissionData={data.submission} />
        </LandingLayout>
    )
}
