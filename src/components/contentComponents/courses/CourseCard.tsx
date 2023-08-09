import { api } from "@/lib/api";
import { IconButton, Tooltip, Typography } from "@mui/material";
import { Button } from "@/components/ui/button";
import { Copy, Edit, Edit2, Trash } from "lucide-react";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { Separator } from "@/components/ui/separator";
import { useToastStore } from "@/zustand/store";
import { useRouter } from "next/router";
import { useState } from "react";
import LevelRow from "./LevelRow";
import CardsSkeleton from "@/components/layout/CardsSkeleton";

const CourseCard = ({ id }: { id: string }) => {
  const { data } = api.courses.getById.useQuery({
    id,
  });
  const course = data?.course;
  const deleteCourseMutation = api.courses.deleteCourses.useMutation();
  const trpcUtils = api.useContext();
  const toast = useToastStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = (id: string) => {
    setLoading(true);
    deleteCourseMutation.mutate([id], {
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

  if (!course) return <CardsSkeleton />;

  return (
    <div>
      <PaperContainer>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Typography>{course.name}</Typography>
            <Tooltip title="Edit Course">
              <IconButton
                onClick={() => router.push(`/content/courses/${course.id}`)}
              >
                <Edit2 className="h-4 w-4" />
              </IconButton>
            </Tooltip>
          </div>
          <Tooltip title="Delete Course">
            <IconButton
              className="text-error hover:bg-red-100 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600 disabled:hover:bg-slate-200"
              disabled={loading}
              onClick={() => handleDelete(course.id)}
            >
              <Trash className="h-4 w-4" />
            </IconButton>
          </Tooltip>
        </div>
        <Separator />
        {course.levels.length === 0 && (
          <div className="p-4">
            <Typography>No levels added yet</Typography>
          </div>
        )}
        {course.levels.map((level, i) => (
          <>
            {i !== 0 && <Separator />}
            <LevelRow key={level.id} level={level} />
          </>
        ))}
        <Separator />
        <div className="flex w-full p-4">
          <Button variant="ghost" type="button">
            <Copy className="mr-2 h-4 w-4" />
            Dublicate
          </Button>
          <Button
            variant="ghost"
            className="ml-auto"
            onClick={() => router.push(`/content/courses/${course.id}`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Configure levels
          </Button>
        </div>
      </PaperContainer>
    </div>
  );
};

export default CourseCard;
