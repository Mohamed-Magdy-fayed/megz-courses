import CustomForm from "@/components/FormsComponents/CustomForm";
import CustomTestForm from "@/components/FormsComponents/CustomTestForm";
import AppLayout from "@/components/layout/AppLayout";
import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { NextPage } from "next";
import { useRouter } from "next/router";

const CreatePlacementOrFinalTest: NextPage = () => {
    const router = useRouter()

    return (
        <AppLayout>
            <div className="space-y-4">
                <div className="flex justify-between">
                    <div className="flex flex-row items-center gap-2">
                        <Button type="button" onClick={() => router.back()} variant={"icon"} customeColor={"infoIcon"}>
                            <ArrowLeft />
                        </Button>
                        <ConceptTitle>Create Tests</ConceptTitle>
                    </div>
                </div>
                <CustomTestForm />
            </div>
        </AppLayout>
    )
}

export default CreatePlacementOrFinalTest