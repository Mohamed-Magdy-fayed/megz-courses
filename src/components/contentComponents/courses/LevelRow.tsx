import { Typography } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { api } from "@/lib/api";
import { useToastStore } from "@/zustand/store";
import { Level } from "@prisma/client";
import { ArrowRight, Edit, Trash } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

const LevelRow = ({ level }: { level: Level }) => {
  const { data, isLoading, isError } = api.lessons.getByLevelId.useQuery({
    levelId: level.id,
  });
  const deleteLevelMutation = api.levels.deleteLevels.useMutation();
  const trpcUtils = api.useContext();
  const toast = useToastStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = (id: string) => {
    if (id === "64d35d5eb84ac3b8c1093813")
      return toast.error(`don't delete that please! ^_^`);
    setLoading(true);
    deleteLevelMutation.mutate([id], {
      onSuccess: () => {
        toast.success(`Deleted!`);
        trpcUtils.courses.invalidate().then(() => setLoading(false));
      },
      onError: () => {
        toast.error("an error occured!");
        setLoading(false);
      },
    });
  };

  return (
    <div className="flex items-center justify-between p-4">
      <div>
        <Typography variant={"secondary"}>{level.name}</Typography>
        <Typography>{level.code}</Typography>
      </div>
      <div>
        {isLoading ? (
          "loading..."
        ) : isError ? (
          "Error!"
        ) : (
          <div className="flex items-center justify-center gap-2">
            <Typography>Lessons#</Typography>
            <ArrowRight className="h-4 w-4" />
            <Typography>{data.lessons.length}</Typography>
          </div>
        )}
      </div>
      <div className="flex items-center justify-center gap-2">
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant={"icon"}
              customeColor={"infoIcon"}
              onClick={() => router.push(`/content/levels/${level.id}`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit Level</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant={"icon"}
              customeColor={"destructiveIcon"}
              disabled={loading}
              className="disabled:cursor-not-allowed"
              onClick={() => handleDelete(level.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete Level</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default LevelRow;
