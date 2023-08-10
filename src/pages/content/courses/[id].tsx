import Spinner from "@/components/Spinner";
import LevelCard from "@/components/contentComponents/levels/LevelCard";
import LevelForm from "@/components/contentComponents/levels/LevelForm";
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

const CoursePage = () => {
  const router = useRouter();
  const id = router.query?.id as string;
  const { data, isLoading, isError } = api.courses.getById.useQuery({ id });
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
            <ConceptTitle>{data?.course?.name}</ConceptTitle>
            <Typography className="text-sm font-medium text-gray-500">
              total levels: {data?.course?.levels.length}
            </Typography>
          </div>
          <Popover
            open={
              !steps.createLevel &&
              steps.manageCourse &&
              !skipTutorial &&
              router.route.startsWith("/content/courses")
            }
          >
            <PopoverTrigger asChild>
              <Button
                onClick={() => {
                  setIsOpen(true);
                  setStep(true, "createLevel");
                }}
                className={cn(
                  "",
                  !steps.createLevel &&
                    steps.manageCourse &&
                    !skipTutorial &&
                    router.route.startsWith("/content/courses") &&
                    "tutorial-ping"
                )}
              >
                <PlusIcon className="mr-2"></PlusIcon>
                Add a level
              </Button>
            </PopoverTrigger>
            <PopoverContent side="bottom">
              You can create levels from here!
            </PopoverContent>
          </Popover>
        </div>
        {isOpen && (
          <PaperContainer>
            <LevelForm id={id} setIsOpen={setIsOpen} />
          </PaperContainer>
        )}
        {isLoading ? (
          <CardsSkeleton />
        ) : isError ? (
          <>Error</>
        ) : !data.course?.levels ? (
          <>No levels yet</>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data?.course?.levels.map((level) => (
              <LevelCard key={level.id} id={level.id} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CoursePage;
