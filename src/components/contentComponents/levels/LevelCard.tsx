import { PaperContainer } from "@/components/ui/PaperContainers";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Copy, Edit, Edit2, Trash } from "lucide-react";
import { useRouter } from "next/router";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import CardsSkeleton from "@/components/layout/CardsSkeleton";
import LessonRow from "./LessonRow";
import { Typography } from "@/components/ui/Typoghraphy";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

const LevelCard = ({ id }: { id: string }) => {
  const { data } = api.levels.getById.useQuery({
    id,
  });
  const level = data?.level;
  const deleteLevelMutation = api.levels.deleteLevels.useMutation();
  const trpcUtils = api.useContext();
  const { toastError, toastSuccess } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = (id: string) => {
    setLoading(true);
    deleteLevelMutation.mutate([id], {
      onSuccess: () => {
        toastSuccess(`Deleted!`);
        trpcUtils.courses.invalidate().then(() => setLoading(false));
      },
      onError: (error) => {
        toastError(error.message);
        setLoading(false);
      },
    });
  };

  if (!level) return <CardsSkeleton />;

  return (
    <div>
      <PaperContainer className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-2">
              <Typography variant={"secondary"}>{level.name}</Typography>
              <Typography className="text-xs font-bold text-primary">
                {level.code}
              </Typography>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={"icon"}
                  customeColor={"mutedIcon"}
                  onClick={() => router.push(`/content/levels/${level.id}`)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Edit Level
              </TooltipContent>
            </Tooltip>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={"icon"}
                customeColor={"destructiveIcon"}
                onClick={() => handleDelete(level.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Delete Level
            </TooltipContent>
          </Tooltip>
        </div>
        <Separator />
        {level.lessons.length === 0 && (
          <div className="p-4 flex-grow">
            <Typography variant={"primary"}>No lessons added yet</Typography>
          </div>
        )}
        {level.lessons.map((lesson, i) => (
          <div key={lesson.id}>
            {i !== 0 && <Separator />}
            <LessonRow key={level.id} lesson={lesson} />
          </div>
        ))}
        <Separator />
        <div className="flex w-full p-4">
          <Button customeColor="foregroundOutlined" type="button" variant={"outline"}>
            <Copy className="h-4 w-4" />
            <Typography>Dublicate</Typography>
          </Button>
          <Button
            customeColor="primary"
            className="ml-auto"
            onClick={() => router.push(`/content/levels/${level.id}`)}
          >
            <Edit className="h-4 w-4" />
            <Typography>Configure levels</Typography>
          </Button>
        </div>
      </PaperContainer>
    </div>
  );
};

export default LevelCard;
