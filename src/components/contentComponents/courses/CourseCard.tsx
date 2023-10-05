import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Copy, Edit, Edit2, Trash } from "lucide-react";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { Separator } from "@/components/ui/separator";
import { useToastStore } from "@/zustand/store";
import { useRouter } from "next/router";
import { useState } from "react";
import LevelRow from "./LevelRow";
import CardsSkeleton from "@/components/layout/CardsSkeleton";
import { Typography } from "@/components/ui/Typoghraphy";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
    <PaperContainer className="flex flex-col">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Typography variant={"secondary"}>{course.name}</Typography>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={"icon"}
                customeColor={"mutedIcon"}
                onClick={() => router.push(`/content/courses/${course.id}`)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Edit Course
            </TooltipContent>
          </Tooltip>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={"icon"}
              customeColor={"destructiveIcon"}
              className="disabled:cursor-not-allowed"
              disabled={loading}
              onClick={() => handleDelete(course.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Delete Course
          </TooltipContent>
        </Tooltip>
      </div>
      <Separator />
      {course.levels.length === 0 && (
        <div className="p-4 flex-grow">
          <Typography variant={"primary"}>No levels added yet</Typography>
        </div>
      )}
      {course.levels.map((level, i) => (
        <div key={level.id} className="flex-grow">
          {i !== 0 && <Separator />}
          <LevelRow level={level} />
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
          onClick={() => router.push(`/content/courses/${course.id}`)}
        >
          <Edit className="h-4 w-4" />
          <Typography>Configure levels</Typography>
        </Button>
      </div>
    </PaperContainer>
  );
};

export default CourseCard;
