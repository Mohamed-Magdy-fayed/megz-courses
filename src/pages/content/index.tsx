import AppLayout from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import CourseForm from "@/components/contentComponents/courses/CourseForm";
import CoursesClient from "@/components/contentComponents/courses/CoursesClient";
import Modal from "@/components/ui/modal";
import { PaperContainer } from "@/components/ui/PaperContainers";

const ContentPage = () => {
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
            </div>
            <Button onClick={() => setIsOpen(true)} customeColor={"primary"}>
              <PlusIcon className="mr-2"></PlusIcon>
              <Typography variant={"buttonText"}>Add</Typography>
            </Button>
          </div>
          <PaperContainer>
            <CoursesClient />
          </PaperContainer>
        </div>
      </div>
    </AppLayout>
  );
};

export default ContentPage;
