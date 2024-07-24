import AppLayout from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import CourseForm from "@/components/contentComponents/courses/CourseForm";
import CoursesClient from "@/components/contentComponents/courses/CoursesClient";
import Spinner from "@/components/Spinner";
import Modal from "@/components/ui/modal";

const ContentPage = () => {
  const { data: coursesData, isLoading, isError } = api.courses.getAll.useQuery();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isMounted) setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <AppLayout>
      <Modal
        title="Add a course"
        description="create a new course"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        children={<CourseForm setIsOpen={setIsOpen} />}
      />
      <div className="p-4">
        <div className="flex w-full flex-col gap-4">
          <div className="flex justify-between">
            <div className="flex flex-col gap-2">
              <ConceptTitle>Courses</ConceptTitle>
              <Typography className="text-sm font-medium text-gray-500">
                total courses: {coursesData?.courses.length}
              </Typography>
            </div>
            <Button onClick={() => setIsOpen(true)} customeColor={"primary"}>
              <PlusIcon className="mr-2"></PlusIcon>
              <Typography variant={"buttonText"}>Add</Typography>
            </Button>
          </div>
          {isLoading ? (
            <Spinner className="w-full h-40" />
          ) : isError ? (
            <>Error</>
          ) : (
            <CoursesClient formattedData={coursesData?.courses ? coursesData.courses.map(course => ({
              id: course.id,
              name: course.name,
              slug: course.slug,
              image: course.image,
              createdAt: course.createdAt,
              updatedAt: course.updatedAt,
              description: course.description,
              groupPrice: course.groupPrice,
              privatePrice: course.privatePrice,
              instructorPrice: course.instructorPrice,
              levels: course.levels,
              orders: course.orders,
            })) : []} />
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ContentPage;
