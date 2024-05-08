import { PaperContainer } from "@/components/ui/PaperContainers";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import { api } from "@/lib/api";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import MaterialsClient from "@/components/contentComponents/materials/MaterialsClient";
import Spinner from "@/components/Spinner";
import CreateMaterialForm from "@/components/contentComponents/materials/CreateMaterialForm";

const CoursePage = () => {
  const router = useRouter();
  const id = router.query?.id as string;
  const { data, isLoading, isError } = api.courses.getById.useQuery({ id });
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
            <ConceptTitle>{data?.course?.name}</ConceptTitle>
            <Typography className="text-sm font-medium text-gray-500">
              total materials: {data?.course?.materialItems.length}
            </Typography>
          </div>
          <Button
            onClick={() => {
              setIsOpen(true);
            }}
          >
            <PlusIcon className="mr-2"></PlusIcon>
            Add a material
          </Button>
        </div>
        {isOpen && (
          <PaperContainer>
            <CreateMaterialForm id={id} setIsOpen={setIsOpen} />
          </PaperContainer>
        )}
        {isLoading ? (
          <Spinner className="w-full h-40" />
        ) : isError ? (
          <>Error</>
        ) : !data.course?.materialItems ? (
          <>No materials yet</>
        ) : (
          <MaterialsClient data={data.course.materialItems} />
        )}
      </div>
    </AppLayout>
  );
};

export default CoursePage;
