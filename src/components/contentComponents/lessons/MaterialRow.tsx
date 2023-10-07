import { Typography } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { MaterialItem } from "@prisma/client";
import { Edit, Trash } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

const MaterialRow = ({ material }: { material: MaterialItem }) => {
  const deleteMaterialMutation =
    api.materials.deleteMaterialItems.useMutation();
  const trpcUtils = api.useContext();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = (id: string) => {
    if (id === "64d4f2bf25c5bf7a1c90bd93")
      return toast({
        variant: "destructive",
        description: `don't delete that please! ^_^`
      });
    setLoading(true);
    deleteMaterialMutation.mutate([id], {
      onSuccess: () => {
        toast({
          variant: "success",
          description: `Deleted!`
        });
        trpcUtils.lessons.invalidate().then(() => setLoading(false));
      },
      onError: () => {
        toast({
          variant: "destructive",
          description: "an error occured!"
        });
        setLoading(false);
      },
    });
  };

  return (
    <div className="flex items-center justify-between p-4">
      <div>
        <Typography variant={"secondary"}>{material.title}</Typography>
      </div>
      <div className="flex items-center justify-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={"icon"}
              customeColor={"infoIcon"}
              onClick={() => router.push(`/content/materials/${material.id}`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit Material</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={"icon"}
              customeColor={"destructiveIcon"}
              disabled={loading}
              className="disabled:cursor-not-allowed"
              onClick={() => handleDelete(material.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete Material</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default MaterialRow;
