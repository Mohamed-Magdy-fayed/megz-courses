import { Typography } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { api } from "@/lib/api";
import { Level } from "@prisma/client";
import { ArrowRight, Edit, Trash } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const LevelRow = ({ level }: { level: Level }) => {
  const { data, isLoading, isError } = api.lessons.getByLevelId.useQuery({
    levelId: level.id,
  });
  const deleteLevelMutation = api.levels.deleteLevels.useMutation();
  const trpcUtils = api.useContext();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toastError, toastSuccess } = useToast()

  const handleDelete = (id: string) => {
    setLoading(true);
    deleteLevelMutation.mutate([id], {
      onSuccess: () => {
        toastSuccess(`Deleted!`)
        trpcUtils.courses.invalidate().then(() => setLoading(false));
      },
      onError: (error) => {
        toastError(error.message)
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
          <TooltipTrigger asChild>
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
          <TooltipTrigger asChild>
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
