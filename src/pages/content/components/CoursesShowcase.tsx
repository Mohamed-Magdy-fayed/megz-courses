import { PaperContainer } from "@/components/ui/PaperContainers";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { useToastStore } from "@/zustand/store";
import { IconButton, Typography } from "@mui/material";
import { Course, Level } from "@prisma/client";
import { Edit, Edit2, Trash, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const CoursesShowcase = ({
  data,
}: {
  data: (Course & {
    levels: Level[];
  })[];
}) => {
  const deleteCourseMutation = api.courses.deleteCourses.useMutation();
  const trpcUtils = api.useContext();
  const toast = useToastStore();
  const router = useRouter();

  const handleDelete = (id: string) => {
    console.log("delete", id);
    deleteCourseMutation.mutate([id], {
      onSuccess: () => {
        toast.success(`Deleted!`);
        trpcUtils.courses.invalidate();
      },
      onError: () => {
        toast.error("an error occured!");
      },
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data.map((course) => (
        <div key={course.id}>
          <PaperContainer>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <Typography>{course.name}</Typography>
                <IconButton
                  onClick={() => router.push(`/content/courses/${course.id}`)}
                >
                  <Edit2 className="h-4 w-4" />
                </IconButton>
              </div>
              <IconButton
                className="text-error hover:bg-red-100"
                onClick={() => handleDelete(course.id)}
              >
                <Trash className="h-4 w-4" />
              </IconButton>
            </div>
            <Separator />
            {course.levels.length === 0 && (
              <div className="p-4">
                <Typography>No levels added yet</Typography>
              </div>
            )}
            {course.levels.map((level) => (
              <div key={level.id}>
                <div>{level.name}</div>
                <div>{level.code}</div>
              </div>
            ))}
            <Separator />
            <div className="flex w-full p-4">
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
      ))}
    </div>
  );
};

export default CoursesShowcase;
