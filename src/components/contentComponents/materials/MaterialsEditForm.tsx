import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import MaterialsForm, { MaterialsFormValues } from "./MaterialsForm";
import { Typography } from "@/components/ui/Typoghraphy";
import { useToast } from "@/components/ui/use-toast";
import { MaterialItem } from "@prisma/client";

const EditMaterialsForm = ({ materialItem }: { materialItem: MaterialItem }) => {
  const [loading, setLoading] = useState(false);

  const {
    leadinText,
    leadinImageUrl,
    firstTestTitle,
    answerCards,
    answerAreas,
    vocabularyCards,
    practiceQuestions,
  } = materialItem.manual!;

  const form = useForm<MaterialsFormValues>({
    defaultValues: {
      title: materialItem.title,
      subTitle: materialItem.subTitle || "",
      answerAreas,
      answerCards,
      firstTestTitle,
      leadinImageUrl,
      leadinText,
      practiceQuestions,
      vocabularyCards,
    },
  });
  const editMaterialMutation = api.materials.editMaterialItem.useMutation();
  const trpcUtils = api.useContext();
  const router = useRouter();
  const { toastError, toastSuccess } = useToast();

  const onSubmit = (data: MaterialsFormValues) => {
    setLoading(true);

    editMaterialMutation.mutate(
      { ...data, id: materialItem.id, slug: "" },
      {
        onSuccess: ({ updatedmaterialItem }) => {
          toastSuccess(`Your material (${updatedmaterialItem.title}) is updated!`);
          trpcUtils.materials.invalidate().then(() => setLoading(false));
        },
        onError: (error) => {
          toastError(error.message);
          setLoading(false);
        },
      }
    );
  };

  return (
    <div className="relative">
      <div className="sticky top-0 bg-background z-50">
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
      </div>
      <MaterialsForm
        form={form}
        loading={loading}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default EditMaterialsForm;
