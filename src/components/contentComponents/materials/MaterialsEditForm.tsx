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
  const { toast } = useToast();

  const onSubmit = (data: MaterialsFormValues) => {
    setLoading(true);

    editMaterialMutation.mutate(
      { ...data, id: materialId },
      {
        onSuccess: ({ updatedmaterialItem }) => {
          toast({
            description: `Your material (${updatedmaterialItem.title}) is updated!`,
            variant: "success"
          });
          trpcUtils.materials.invalidate().then(() => setLoading(false));
        },
        onError: () => {
          toast({
            description: "somthing went wrong!",
            variant: "destructive"
          });
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
