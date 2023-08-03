import Spinner from "@/components/Spinner";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/AppLayout";
import { api } from "@/lib/api";
import { Typography } from "@mui/material";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import MaterialsForm from "./components/MaterialsForm";
import MaterialsShowcase from "./components/MaterialsShowcase";

const LessonPage = () => {
  const router = useRouter();
  const id = router.query.lessonId as string;
  const { data, isLoading, isError } = api.lessons.getById.useQuery({ id });
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <ConceptTitle>{data?.lesson?.name}</ConceptTitle>
            <Typography className="text-sm font-medium text-gray-500">
              total materials: {data?.lesson?.materials.length}
            </Typography>
          </div>
          <Button onClick={() => setIsOpen(true)}>
            <PlusIcon className="mr-2"></PlusIcon>
            Add material
          </Button>
        </div>
        {isOpen && (
          <PaperContainer>
            <MaterialsForm id={id} setIsOpen={setIsOpen} />
          </PaperContainer>
        )}
        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <>Error</>
        ) : !data.lesson?.materials ? (
          <>No materials yet</>
        ) : (
          <MaterialsShowcase data={data.lesson?.materials}></MaterialsShowcase>
        )}
      </div>
    </AppLayout>
  );
};

export default LessonPage;
