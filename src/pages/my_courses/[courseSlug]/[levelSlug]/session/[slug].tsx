import Spinner from "@/components/Spinner";
import MaterialShowcase from "@/components/contentComponents/materials/MaterialShowcase";
import LearningLayout from "@/components/LearningLayout/LearningLayout";
import { api } from "@/lib/api";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

const SessionPage: NextPage = () => {
    const router = useRouter()
    const courseSlug = router.query.courseSlug as string
    const levelSlug = router.query.levelSlug as string
    const materialItemSlug = router.query.slug as string
    const { data: courseData } = api.courses.getBySlug.useQuery({ slug: courseSlug });
    const { data: levelData } = api.levels.getBySlug.useQuery({ slug: levelSlug });
    const { data: materialData } = api.materials.getBySlug.useQuery({ slug: materialItemSlug });

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted)
        return (
            <LearningLayout>
                <Spinner />
            </LearningLayout>
        );

    if (!materialData?.materialItem || !courseData?.course || !levelData?.level)
        return (
            <LearningLayout>
                <Spinner />
            </LearningLayout>
        );

    return (
        <LearningLayout>
            <MaterialShowcase course={courseData.course} materialItem={materialData.materialItem} />
        </LearningLayout>
    )
}

export default SessionPage