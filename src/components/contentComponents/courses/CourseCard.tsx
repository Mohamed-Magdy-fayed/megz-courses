import { api } from "@/lib/api";
import { IconButton, Tooltip, Typography } from "@mui/material";
import { Button } from "@/components/ui/button";
import { Copy, Edit, Edit2, PlusIcon, Trash } from "lucide-react";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { Separator } from "@/components/ui/separator";
import { useToastStore, useTutorialStore } from "@/zustand/store";
import { useRouter } from "next/router";
import { useState } from "react";
import LevelRow from "./LevelRow";
import CardsSkeleton from "@/components/layout/CardsSkeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const CourseCard = ({ id }: { id: string }) => {
  const { data } = api.courses.getById.useQuery({
    id,
  });
  const course = data?.course;
  const deleteCourseMutation = api.courses.deleteCourses.useMutation();
  const trpcUtils = api.useContext();
  const toast = useToastStore();
  const { skipTutorial, steps, setStep, setSkipTutorial } = useTutorialStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = (id: string) => {
    if (id === "64d35a9fb84ac3b8c109380c")
      return toast.error(`don't delete that please! ^_^`);
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
            {course.name === "Beginner Vocabulary" ? (
              <Popover
                open={
                  !steps.manageCourse &&
                  steps.confirmCreateCourse &&
                  !skipTutorial &&
                  router.route === "/content"
                }
              >
                <PopoverTrigger asChild>
                  <Tooltip title="Edit Course">
                    <IconButton
                      onClick={() => {
                        setStep(true, "manageCourse");
                        router.push(`/content/courses/${course.id}`);
                      }}
                      className={cn(
                        "",
                        !steps.manageCourse &&
                          steps.confirmCreateCourse &&
                          !skipTutorial &&
                          router.route === "/content" &&
                          "tutorial-ping"
                      )}
                    >
                      <Edit2 className="h-4 w-4" />
                    </IconButton>
                  </Tooltip>
                </PopoverTrigger>
                <PopoverContent side="bottom">
                  You can manage your course from here!
                </PopoverContent>
              </Popover>
            ) : (
              <Tooltip title="Edit Course">
                <IconButton
                  onClick={() => router.push(`/content/courses/${course.id}`)}
                >
                  <Edit2 className="h-4 w-4" />
                </IconButton>
              </Tooltip>
            )}
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
