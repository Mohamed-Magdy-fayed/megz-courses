import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useState } from "react";
import { useToastStore } from "@/zustand/store";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import MaterialsForm, { MaterialsFormValues } from "./MaterialsForm";
import { Typography } from "@/components/ui/Typoghraphy";

const EditMaterialsForm = ({ materialId }: { materialId: string }) => {
  const { data } = api.materials.getById.useQuery({ id: materialId });
  const [loading, setLoading] = useState(false);

  const {
    leadinText,
    leadinImageUrl,
    title,
    subTitle,
    firstTestTitle,
    answerCards,
    answerAreas,
    vocabularyCards,
    practiceQuestions,
  } = data?.materialItem!;

  const form = useForm<MaterialsFormValues>({
    defaultValues: {
      answerAreas,
      answerCards,
      firstTestTitle,
      leadinImageUrl,
      leadinText,
      practiceQuestions,
      subTitle,
      title,
      vocabularyCards,
    },
  });
  const editMaterialMutation = api.materials.editMaterialItem.useMutation();
  const trpcUtils = api.useContext();
  const router = useRouter();
  const toast = useToastStore();

  const onSubmit = (data: MaterialsFormValues) => {
    setLoading(true);

    editMaterialMutation.mutate(
      { ...data, id: materialId },
      {
        onSuccess: ({ updatedmaterialItem }) => {
          toast.success(
            `Your material (${updatedmaterialItem.title}) is updated!`
          );
          trpcUtils.materials.invalidate().then(() => setLoading(false));
        },
        onError: () => {
          toast.error("somthing went wrong!");
          setLoading(false);
        },
      }
    );
  };

  return (
    <div>
      <div className="flex items-center gap-4 p-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant={"icon"} customeColor={"mutedIcon"} onClick={() => router.back()}>
              <ArrowLeft className="text-primary" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Go back
          </TooltipContent>
        </Tooltip>
        <Typography variant={"secondary"}>Edit material</Typography>
      </div>
      <Separator />
      <MaterialsForm
        form={form}
        loading={loading}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default EditMaterialsForm;
