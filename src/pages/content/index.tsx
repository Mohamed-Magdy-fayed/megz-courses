import AppLayout from "@/layouts/AppLayout";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { Typography } from "@mui/material";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { PaperContainer } from "@/components/ui/PaperContainers";
import CourseForm from "@/components/contentComponents/courses/CourseForm";
import CourseCard from "@/components/contentComponents/courses/CourseCard";
import CardsSkeleton from "@/components/layout/CardsSkeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTutorialStore } from "@/zustand/store";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";

const ContentPage = () => {
  const { data, isLoading, isError } = api.courses.getAll.useQuery();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { skipTutorial, steps, setStep, setSkipTutorial } = useTutorialStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isMounted) setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <AppLayout>
      <div className="p-4">
        <div className="flex w-full flex-col gap-4">
          <div className="flex justify-between">
            <div className="flex flex-col gap-2">
              <ConceptTitle>Courses</ConceptTitle>
              <Typography className="text-sm font-medium text-gray-500">
                total courses: {data?.courses.length}
              </Typography>
            </div>
            <Popover
              open={
                !steps.createCourse &&
                !skipTutorial &&
                router.route === "/content"
              }
            >
              <PopoverTrigger asChild>
                <Button
                  onClick={() => {
                    setIsOpen(true);
                    setStep(true, "createCourse");
                  }}
                  className={cn(
                    "",
                    !steps.createCourse &&
                      !skipTutorial &&
                      router.route === "/content" &&
                      "tutorial-ping"
                  )}
                >
                  <PlusIcon className="mr-2"></PlusIcon>
                  Create a course
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom">
                You can create a coures from here!
              </PopoverContent>
            </Popover>
          </div>
          {isOpen && (
            <PaperContainer>
              <CourseForm setIsOpen={setIsOpen} />
            </PaperContainer>
          )}
          {isLoading ? (
            <CardsSkeleton />
          ) : isError ? (
            <>Error</>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data?.courses.map((course) => (
                <CourseCard id={course.id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ContentPage;
