import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { X } from "lucide-react";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { Typography } from "@/components/ui/Typoghraphy";
import MaterialsForm, { MaterialsFormValues } from "./MaterialsForm";
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

    const createMaterialMutation = api.materials.createMaterialItem.useMutation();
    const trpcUtils = api.useContext();
    const { toastError, toastSuccess } = useToast();

    const onSubmit = (data: MaterialsFormValues) => {
        setLoading(true);

        createMaterialMutation.mutate(
            { ...data, lessonId: id },
            {
                onSuccess: ({ materialItem }) => {
                    toastSuccess(`Your new material (${materialItem.title}) is ready!`);
                    trpcUtils.lessons.invalidate();
                    setLoading(false);
                },
                onError: (error) => {
                    toastError(error.message)
                    setLoading(false);
                },
            }
        );
    };

    return (
        <div>
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-8">
                    <Typography variant={"secondary"}>Create material</Typography>
                    <Typography>(using the TTT vocab framework)</Typography>
                </div>
                <Button variant={"x"} onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <Separator />
            <MaterialsForm
                form={form}
                loading={loading}
                setIsOpen={setIsOpen}
                onSubmit={onSubmit}
            />
        </div>
    );
};

export default CreateMaterialsForm;
