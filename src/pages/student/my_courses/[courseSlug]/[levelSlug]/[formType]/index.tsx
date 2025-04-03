import LearningLayout from "@/components/pages/LearningLayout/LearningLayout";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import SystemFormCard from "@/components/admin/systemManagement/systemForms/SystemFormCard";

const FinalTestPage: NextPage = () => {
    const router = useRouter()
    const courseSlug = router.query.courseSlug as string
    const levelSlug = router.query.levelSlug as string

    return (
        <LearningLayout>
            <SystemFormCard
                courseSlug={courseSlug}
                levelSlug={levelSlug}
                formType={"FinalTest"}
                enabled={!!courseSlug && !!levelSlug}
            />
        </LearningLayout>
    )
}

export default FinalTestPage