import { PaperContainer } from "@/components/ui/PaperContainers";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Edit, Edit2, Trash, X } from "lucide-react";
import { useRouter } from "next/router";
import { MaterialItem } from "@prisma/client";
import { useToastStore } from "@/zustand/store";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Typography } from "@/components/ui/Typoghraphy";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const MaterialCard = ({ material }: { material: MaterialItem }) => {
  const deleteMaterialMutation =
    api.materials.deleteMaterialItems.useMutation();
  const trpcUtils = api.useContext();
  const toast = useToastStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = (id: string) => {
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={"icon"}
                  customeColor={"mutedIcon"}
                  onClick={() => router.push(`/content/materials/${material.id}`)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Edit Material
              </TooltipContent>
            </Tooltip>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={"icon"}
                customeColor={"destructiveIcon"}
                onClick={() => {
                  router.push(`/content/materials/${material.id}`);
                }}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Delete Material
            </TooltipContent>
          </Tooltip>
        </div>
        <Separator />
        <div className="flex w-full p-4">
          <Button
            variant="outline"
            customeColor="foregroundOutlined"
            onClick={() =>
              router.push(`/content/materials/${material.id}/show`)
            }
          >
            <Edit className="mr-2 h-4 w-4" />
            Showcase
          </Button>
          <Button
            customeColor="primary"
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
