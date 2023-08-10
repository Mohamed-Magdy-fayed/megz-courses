import { PaperContainer } from "@/components/ui/PaperContainers";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { IconButton, Tooltip, Typography } from "@mui/material";
import { Edit, Edit2, Trash, X } from "lucide-react";
import { useRouter } from "next/router";
import { MaterialItem } from "@prisma/client";
import { useToastStore, useTutorialStore } from "@/zustand/store";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const MaterialCard = ({ material }: { material: MaterialItem }) => {
  const deleteMaterialMutation =
    api.materials.deleteMaterialItems.useMutation();
  const trpcUtils = api.useContext();
  const toast = useToastStore();
  const { skipTutorial, steps, setStep, setSkipTutorial } = useTutorialStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = (id: string) => {
    if (id === "64d4f2bf25c5bf7a1c90bd93")
      return toast.error(`Don't delete that please! ^_^`);

    setLoading(true);
    deleteMaterialMutation.mutate([id], {
      onSuccess: () => {
        toast.success(`Deleted!`);
        trpcUtils.lessons.invalidate().then(() => setLoading(false));
      },
      onError: () => {
        toast.error("an error occured!");
        setLoading(false);
      },
    });
  };

  return (
    <div key={material.id}>
      <PaperContainer>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-2">
              <Typography>{material.title}</Typography>
            </div>
            <Tooltip title="Edit Material">
              <IconButton
                onClick={() => {
                  setStep(true, "manageMaterial");
                  router.push(`/content/materials/${material.id}`);
                }}
              >
                <Edit2 className="h-4 w-4" />
              </IconButton>
            </Tooltip>
          </div>
          <Tooltip title="Delete Material">
            <IconButton
              disabled={loading}
              className="text-error hover:bg-red-100 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600 disabled:hover:bg-slate-200"
              onClick={() => handleDelete(material.id)}
            >
              <Trash className="h-4 w-4" />
            </IconButton>
          </Tooltip>
        </div>
        <Separator />
        <div className="flex w-full p-4">
          {material.title === "Vocab" ? (
            <Popover
              open={
                !steps.manageMaterial &&
                steps.confirmCreateMaterial &&
                !skipTutorial &&
                router.route.startsWith("/content/lessons")
              }
            >
              <PopoverTrigger asChild>
                <Button
                  className={cn(
                    "",
                    !steps.manageMaterial &&
                      steps.confirmCreateMaterial &&
                      !skipTutorial &&
                      router.route.startsWith("/content/lessons") &&
                      "tutorial-ping"
                  )}
                  variant="ghost"
                  onClick={() => {
                    router.push(`/content/materials/${material.id}/show`);
                    setStep(true, "manageMaterial");
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Showcase
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom">
                Finally view how your material looks as a student!
              </PopoverContent>
            </Popover>
          ) : (
            <Button
              variant="ghost"
              onClick={() =>
                router.push(`/content/materials/${material.id}/show`)
              }
            >
              <Edit className="mr-2 h-4 w-4" />
              Showcase
            </Button>
          )}
          <Button
            variant="ghost"
            className="ml-auto"
            onClick={() => router.push(`/content/materials/${material.id}`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Configure materials
          </Button>
        </div>
      </PaperContainer>
    </div>
  );
};

export default MaterialCard;
