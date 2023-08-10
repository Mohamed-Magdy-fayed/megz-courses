import LessonCard from "@/components/contentComponents/lessons/LessonCard";
import LessonForm from "@/components/contentComponents/lessons/LessonForm";
import CardsSkeleton from "@/components/layout/CardsSkeleton";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import AppLayout from "@/layouts/AppLayout";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useTutorialStore } from "@/zustand/store";
import { Typography } from "@mui/material";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const LevelPage = () => {
  const router = useRouter();
  const id = router.query.id as string;
  const { data, isLoading, isError } = api.levels.getById.useQuery({ id });
  const [isOpen, setIsOpen] = useState(false);
  const { skipTutorial, steps, setStep, setSkipTutorial } = useTutorialStore();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isMounted) setIsMounted(true);
  }, []);

  if (!isMounted) return null;
  
  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <ConceptTitle>{data?.level?.name}</ConceptTitle>
            <Typography className="text-sm font-medium text-gray-500">
              Code: {data?.level?.code}
            </Typography>
            <Typography className="text-sm font-medium text-gray-500">
              total lessons: {data?.level?.lessons.length}
            </Typography>
          </div>
          <Popover
            open={
              !steps.createLesson &&
              steps.manageLevel &&
              !skipTutorial &&
              router.route.startsWith("/content/levels")
            }
          >
            <PopoverTrigger asChild>
              <Button
                onClick={() => {
                  setIsOpen(true);
                  setStep(true, "createLesson");
                }}
                className={cn(
                  "",
                  !steps.createLesson &&
                    steps.manageLevel &&
                    !skipTutorial &&
                    router.route.startsWith("/content/levels") &&
                    "tutorial-ping"
                )}
              >
                <PlusIcon className="mr-2"></PlusIcon>
                Add a lesson
              </Button>
            </PopoverTrigger>
            <PopoverContent side="bottom">
              Now create lessons for this level!
            </PopoverContent>
          </Popover>
        </div>
        {isOpen && (
          <PaperContainer>
            <LessonForm id={id} setIsOpen={setIsOpen} />
          </PaperContainer>
        )}
        {isLoading ? (
          <CardsSkeleton />
        ) : isError ? (
          <>Error</>
        ) : !data.level?.lessons ? (
          <>No materials yet</>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.level?.lessons.map((lesson) => (
              <LessonCard lesson={lesson} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default LevelPage;
