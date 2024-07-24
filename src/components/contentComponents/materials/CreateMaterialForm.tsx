import { api } from "@/lib/api";
import { useState } from "react";
import { useForm } from "react-hook-form";
import MaterialsForm, { type MaterialsFormValues } from "./MaterialsForm";
import { useToast } from "@/components/ui/use-toast";

const CreateMaterialsForm = ({
    setIsOpen,
    id,
}: {
    setIsOpen: (val: boolean) => void;
    id: string;
}) => {
    const [loading, setLoading] = useState(false);

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

    const createMaterialMutation = api.materials.createMaterialItem.useMutation({
        onMutate: () => setLoading(true),
        onSuccess: ({ materialItem }) =>
            trpcUtils.courses.invalidate().then(() => {
                toastSuccess(`Your new material (${materialItem.title}) is ready!`)
                setIsOpen(false)
            }),
        onError: ({ message }) => toastError(message),
        onSettled: () => setLoading(false),
    });
    const trpcUtils = api.useContext();
    const { toastError, toastSuccess } = useToast();

    const onSubmit = (data: MaterialsFormValues) => {
        createMaterialMutation.mutate({ ...data, courseLevelId: id, slug: "" },);
    };

    return (
        <MaterialsForm
            form={form}
            loading={loading}
            setIsOpen={setIsOpen}
            onSubmit={onSubmit}
        />
    );
};

export default CreateMaterialsForm;
