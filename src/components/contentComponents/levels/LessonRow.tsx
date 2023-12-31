import { Typography } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { api } from "@/lib/api";
import { Lesson } from "@prisma/client";
import { ArrowRight, Edit, Trash } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const LessonRow = ({ lesson }: { lesson: Lesson }) => {
  const { data, isLoading, isError } = api.materials.getByLessonId.useQuery({
    lessonId: lesson.id,
  });
  const deleteLessonMutation = api.lessons.deleteLessons.useMutation();
  const trpcUtils = api.useContext();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast()

  const handleDelete = (id: string) => {
    if (id === "64d370ceb84ac3b8c1093819")
      return toast({
        variant: "destructive",
        description: `don't delete that please! ^_^`,
      });
    setLoading(true);
    deleteLessonMutation.mutate([id], {
      onSuccess: () => {
        toast({
          variant: "success",
          description: `Deleted!`
        })
        trpcUtils.levels.invalidate().then(() => setLoading(false));
      },
      onError: () => {
        toast({
          variant: "success",
          description: "an error occured!"
        })
        setLoading(false);
      },
    });
  };

  return (
    <div className="flex items-center justify-between p-4">
      <div>
        <Typography variant={"secondary"}>{lesson.name}</Typography>
      </div>
      <div>
        {isLoading ? (
          "loading..."
        ) : isError ? (
          "Error!"
        ) : (
          <div className="flex items-center justify-center gap-2">
            <Typography>Materials#</Typography>
            <ArrowRight className="h-4 w-4" />
            <Typography>{data.materialItems.length}</Typography>
          </div>
        )}
      </div>
      <div className="flex items-center justify-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={"icon"}
              customeColor={"infoIcon"}
              onClick={() => router.push(`/content/lessons/${lesson.id}`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit Lesson</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={"icon"}
              customeColor={"destructiveIcon"}
              disabled={loading}
              className="disabled:cursor-not-allowed"
              onClick={() => handleDelete(lesson.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete Lesson</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default LessonRow;
