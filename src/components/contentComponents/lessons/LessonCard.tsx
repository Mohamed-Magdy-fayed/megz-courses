import { PaperContainer } from "@/components/ui/PaperContainers";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { useToastStore } from "@/zustand/store";
import { IconButton, Tooltip, Typography } from "@mui/material";
import { Lesson, MaterialItem } from "@prisma/client";
import { Edit, Edit2, Trash, X } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import MaterialRow from "./MaterialRow";

const LessonCard = ({
  lesson,
}: {
  lesson: Lesson & { materials: MaterialItem[] };
}) => {
  const deleteLessonsMutation = api.lessons.deleteLessons.useMutation();
  const trpcUtils = api.useContext();
  const toast = useToastStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = (id: string) => {
    if (id === "64d370ceb84ac3b8c1093819")
      return toast.error(`don't delete that please! ^_^`);
    setLoading(true);
    deleteLessonsMutation.mutate([id], {
      onSuccess: () => {
        toast.success(`Deleted!`);
        trpcUtils.levels.invalidate().then(() => setLoading(false));
      },
      onError: () => {
        toast.error("an error occured!");
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
              <Typography>{lesson.name}</Typography>
            </div>
            <Tooltip title="Edit Lesson">
              <IconButton
                onClick={() => {
                  router.push(`/content/lessons/${lesson.id}`);
                }}
              >
                <Edit2 className="h-4 w-4" />
              </IconButton>
            </Tooltip>
          </div>
          <Tooltip title="Delete Lesson">
            <IconButton
              disabled={loading}
              className="text-error hover:bg-red-100 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600 disabled:hover:bg-slate-200"
              onClick={() => handleDelete(lesson.id)}
            >
              <Trash className="h-4 w-4" />
            </IconButton>
          </Tooltip>
        </div>
        <Separator />
        {lesson.materials.length === 0 && (
          <div className="p-4">
            <Typography>No materials added yet</Typography>
          </div>
        )}
        {lesson.materials.map((material, i) => (
          <>
            {i !== 0 && <Separator />}
            <MaterialRow key={material.id} material={material} />
          </>
        ))}
        <Separator />
        <div className="flex w-full p-4">
          <Button
            variant="ghost"
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
