import { PaperContainer } from "@/components/ui/PaperContainers";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { IconButton, Typography } from "@mui/material";
import { Edit, Edit2, Trash } from "lucide-react";
import { useRouter } from "next/router";
import { Separator } from "@/components/ui/separator";
import { useToastStore } from "@/zustand/store";
import { Lesson, Level } from "@prisma/client";

const LevelsShowcase = ({
  data,
}: {
  data: (Level & {
    lessons: Lesson[];
  })[];
}) => {
  const deleteLevelMutation = api.levels.deleteLevels.useMutation();
  const trpcUtils = api.useContext();
  const toast = useToastStore();
  const router = useRouter();

  const handleDelete = (id: string) => {
    deleteLevelMutation.mutate([id], {
      onSuccess: () => {
        toast.success(`Deleted!`);
        trpcUtils.levels.invalidate();
      },
      onError: () => {
        toast.error("an error occured!");
      },
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data.map((level) => (
        <div key={level.id}>
          <PaperContainer>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-2">
                  <Typography>{level.name}</Typography>
                  <Typography className="text-xs font-bold text-primary">
                    {level.code}
                  </Typography>
                </div>
                <IconButton
                  onClick={() => router.push(`/content/levels/${level.id}`)}
                >
                  <Edit2 className="h-4 w-4" />
                </IconButton>
              </div>
              <IconButton
                className="text-error hover:bg-red-100"
                onClick={() => handleDelete(level.id)}
              >
                <Trash className="h-4 w-4" />
              </IconButton>
            </div>
            <Separator />
            {level.lessons.length === 0 && (
              <div className="p-4">
                <Typography>No lessons added yet</Typography>
              </div>
            )}
            {level.lessons.map((lesson) => (
              <div key={lesson.id}>
                <div>{lesson.name}</div>
              </div>
            ))}
            <Separator />
            <div className="flex w-full p-4">
              <Button
                variant="ghost"
                className="ml-auto"
                onClick={() => router.push(`/content/levels/${level.id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Configure lessons
              </Button>
            </div>
          </PaperContainer>
        </div>
      ))}
    </div>
  );
};

export default LevelsShowcase;
