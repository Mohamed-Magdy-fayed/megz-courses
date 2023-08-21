import MaterialCard from "@/components/contentComponents/materials/MaterialCard";
import MaterialsForm from "@/components/contentComponents/materials/MaterialsForm";
import CardsSkeleton from "@/components/layout/CardsSkeleton";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/AppLayout";
import { api } from "@/lib/api";
import { Typography } from "@mui/material";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const LessonPage = () => {
  const router = useRouter();
  const id = router.query.lessonId as string;
  const { data, isLoading, isError } = api.lessons.getById.useQuery({ id });
  const [isOpen, setIsOpen] = useState(false);
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
            <ConceptTitle>{data?.lesson?.name}</ConceptTitle>
            <Typography className="text-sm font-medium text-gray-500">
              total materials: {data?.lesson?.materials.length}
            </Typography>
          </div>
          <Button
            onClick={() => {
              setIsOpen(true);
            }}
          >
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
          <CardsSkeleton />
        ) : isError ? (
          <>Error</>
        ) : !data.lesson?.materials ? (
          <>No materials yet</>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.lesson.materials.map((material) => (
              <MaterialCard material={material} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default LessonPage;
