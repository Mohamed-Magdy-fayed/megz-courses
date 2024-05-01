import { PaperContainer } from "@/components/ui/PaperContainers";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { Lesson, MaterialItem } from "@prisma/client";
import { Copy, Edit, Edit2, Trash } from "lucide-react";
import { useRouter } from "next/router";
import { Fragment, useState } from "react";
import MaterialRow from "./MaterialRow";
import { Typography } from "@/components/ui/Typoghraphy";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

const LessonCard = ({
  lesson,
}: {
  lesson: Lesson & { materials: MaterialItem[] };
}) => {
  const deleteLessonsMutation = api.lessons.deleteLessons.useMutation();
  const trpcUtils = api.useContext();
  const { toastError, toastSuccess } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = (id: string) => {
    setLoading(true);
    deleteLessonsMutation.mutate([id], {
      onSuccess: () => {
        toastSuccess(`Deleted!`);
        trpcUtils.levels.invalidate().then(() => setLoading(false));
      },
      onError: (error) => {
        toastError(error.message)
        setLoading(false);
      },
    });
  };

  return (
    <div key={lesson.id}>
      <PaperContainer>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-2">
              <Typography variant={"secondary"}>{lesson.name}</Typography>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={"icon"}
                  customeColor={"mutedIcon"}
                  onClick={() => router.push(`/content/lessons/${lesson.id}`)}
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
                onClick={() => handleDelete(lesson.id)}
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
        {lesson.materials.length === 0 && (
          <div className="p-4">
            <Typography variant={'primary'}>No materials added yet</Typography>
          </div>
        )}
        {lesson.materials.map((material, i) => (
          <Fragment key={material.id}>
            {i !== 0 && <Separator />}
            <MaterialRow key={material.id} material={material} />
          </Fragment>
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
            onClick={() => router.push(`/content/lessons/${lesson.id}`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Configure lessons
          </Button>
        </div>
      </PaperContainer>
    </div>
  );
};

export default LessonCard;
