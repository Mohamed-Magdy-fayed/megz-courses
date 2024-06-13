import Spinner from "@/components/Spinner";
import MaterialShowcase from "@/components/contentComponents/materials/MaterialShowcase";
import LearningLayout from "@/components/landingPageComponents/LearningLayout";
import { api } from "@/lib/api";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

const SessionPage: NextPage = () => {
    const id = useRouter().query.sessionId as string
    const { data, isLoading, isError } = api.materials.getById.useQuery({ id });

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

    if (isLoading || !data?.materialItem)
        return (
            <LearningLayout>
                <Spinner />
            </LearningLayout>
        );

    if (isError) return <LearningLayout>Error!</LearningLayout>;

    return (
        <LearningLayout>
            <MaterialShowcase materialItem={data.materialItem} />
        </LearningLayout>
    )
}

export default SessionPage