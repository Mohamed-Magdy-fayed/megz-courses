import CustomForm from "@/components/FormsComponents/CustomForm";
import Spinner from "@/components/Spinner";
import AppLayout from "@/components/layout/AppLayout";
import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { api } from "@/lib/api";
import type { NextPage } from "next";
import { useRouter } from "next/router";

const EditQuizOrAssignment: NextPage = () => {
    const router = useRouter()
    const id = router.query.evalFormId as string
    const { data } = api.evaluationForm.getEvalFormById.useQuery({ id })

    return (
        <AppLayout>
            <div className="space-y-4">
                <div className="flex justify-between">
                    <div className="flex flex-col gap-2">
                        <ConceptTitle>Edit a Quiz or an Assignment</ConceptTitle>
                    </div>
                </div>
                {!data?.evaluationForm ? <Spinner className="mx-auto" /> : <CustomForm initialData={data.evaluationForm} />}
            </div>
        </AppLayout>
    )
}

export default EditQuizOrAssignment