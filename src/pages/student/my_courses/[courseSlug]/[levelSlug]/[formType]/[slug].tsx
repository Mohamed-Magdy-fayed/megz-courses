"use client"

import LearningLayout from "@/components/pages/LearningLayout/LearningLayout";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import SystemFormCard from "@/components/admin/systemManagement/systemForms/SystemFormCard";
import { SystemFormTypes } from "@prisma/client";
import Spinner from "@/components/ui/Spinner";

const AssignmentPage: NextPage = () => {
    const router = useRouter()
    const courseSlug = router.query.courseSlug as string
    const slug = router.query.slug as string
    const type: SystemFormTypes | undefined = router.query.formType === "assignment" ? "Assignment" : router.query.formType === "quiz" ? "Quiz" : undefined

    if (!type) return (
        <LearningLayout>
            <Spinner />
        </LearningLayout>
    )

    return (
        <LearningLayout>
            <SystemFormCard
                courseSlug={courseSlug}
                formType={type}
                enabled={!!courseSlug && !!slug && !!type}
                materialItemSlug={slug}
            />
        </LearningLayout>
    )
}

export default AssignmentPage