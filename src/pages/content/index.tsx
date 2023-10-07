import AppLayout from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { PaperContainer } from "@/components/ui/PaperContainers";
import CourseForm from "@/components/contentComponents/courses/CourseForm";
import CourseCard from "@/components/contentComponents/courses/CourseCard";
import CardsSkeleton from "@/components/layout/CardsSkeleton";

const ContentPage = () => {
  const { data, isLoading, isError } = api.courses.getAll.useQuery();
  const [isOpen, setIsOpen] = useState(false);
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
            <Button onClick={() => setIsOpen(true)} customeColor={"primary"}>
              <PlusIcon className="mr-2"></PlusIcon>
              <Typography variant={"buttonText"}>Add</Typography>
            </Button>
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
