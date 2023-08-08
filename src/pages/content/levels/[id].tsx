import Spinner from "@/components/Spinner";
import LessonForm from "@/components/contentComponents/LessonForm";
import LessonsShowcase from "@/components/contentComponents/LessonsShowcase";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/AppLayout";
import { api } from "@/lib/api";
import { Typography } from "@mui/material";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

const LevelPage = () => {
  const router = useRouter();
  const id = router.query.id as string;
  const { data, isLoading, isError } = api.levels.getById.useQuery({ id });
  const [isOpen, setIsOpen] = useState(false);

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
          <Button onClick={() => setIsOpen(true)}>
            <PlusIcon className="mr-2"></PlusIcon>
            Add a lesson
          </Button>
        </div>
        {isOpen && (
          <PaperContainer>
            <LessonForm id={id} setIsOpen={setIsOpen} />
          </PaperContainer>
        )}
        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <>Error</>
        ) : !data.level?.lessons ? (
          <>No materials yet</>
        ) : (
          <LessonsShowcase data={data.level?.lessons}></LessonsShowcase>
        )}
      </div>
    </AppLayout>
  );
};

export default LevelPage;
