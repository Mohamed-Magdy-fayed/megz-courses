import { api } from "@/lib/api";
import { useToastStore } from "@/zustand/store";
import { IconButton, Tooltip, Typography } from "@mui/material";
import { Lesson } from "@prisma/client";
import { ArrowRight, Edit, Trash } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

const LessonRow = ({ lesson }: { lesson: Lesson }) => {
  const { data, isLoading, isError } = api.materials.getByLessonId.useQuery({
    lessonId: lesson.id,
  });
  const deleteLessonMutation = api.lessons.deleteLessons.useMutation();
  const trpcUtils = api.useContext();
  const toast = useToastStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = (id: string) => {
    setLoading(true);
    deleteLessonMutation.mutate([id], {
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
    <div className="flex items-center justify-between p-4">
      <div>
        <Typography>{lesson.name}</Typography>
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
        <Tooltip title="Edit Lesson">
          <IconButton
            onClick={() => router.push(`/content/lessons/${lesson.id}`)}
          >
            <Edit className="h-4 w-4" />
          </IconButton>
        </Tooltip>
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
    </div>
  );
};

export default LessonRow;
