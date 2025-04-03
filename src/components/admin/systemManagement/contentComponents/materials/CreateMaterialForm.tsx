import { api } from "@/lib/api";
import { useState } from "react";
import { useForm } from "react-hook-form";
import MaterialsForm, { type MaterialsFormValues } from "./MaterialsForm";
import { toastType, useToast } from "@/components/ui/use-toast";
import { createMutationOptions } from "@/lib/mutationsHelper";

const CreateMaterialsForm = ({
    setIsOpen,
    id,
}: {
    setIsOpen: (val: boolean) => void;
    id: string;
}) => {
    const [loadingToast, setLoadingToast] = useState<toastType | undefined>(undefined);

    const form = useForm<MaterialsFormValues>({
        defaultValues: {
            answerAreas: [],
            answerCards: [],
            firstTestTitle: "",
            leadinImageUrl: "",
            leadinText: "",
            practiceQuestions: [],
            subTitle: "",
            title: "",
            vocabularyCards: [],
        },
    });

    const { toast } = useToast();
    const trpcUtils = api.useUtils();
    const createMaterialMutation = api.materials.createMaterialItem.useMutation(
        createMutationOptions({
            trpcUtils,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: ({ materialItem }) => {
                return `Your new material (${materialItem.title}) is ready!`
            },
            loadingMessage: "Creating...",
        })
    )

    const onSubmit = (data: MaterialsFormValues) => {
        createMaterialMutation.mutate({ ...data, courseLevelId: id, slug: "" });
    };

    return (
        <MaterialsForm
            form={form}
            loading={!!loadingToast}
            setIsOpen={setIsOpen}
            onSubmit={onSubmit}
        />
    );
};

export default CreateMaterialsForm;
