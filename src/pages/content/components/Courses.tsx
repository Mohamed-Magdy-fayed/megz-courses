import { PaperContainer } from "@/components/ui/PaperContainers";
import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Typography } from "@mui/material";
import { PlusIcon } from "lucide-react";
import React, { useState } from "react";
import CourseForm from "./CourseForm";
import Spinner from "@/components/Spinner";
import CoursesShowcase from "./CoursesShowcase";

const Courses = () => {
  const { data, isLoading, isError } = api.courses.getAll.useQuery();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-4">
      <div className="flex w-full flex-col gap-4">
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <ConceptTitle>Courses</ConceptTitle>
            <Typography className="text-sm font-medium text-gray-500">
              total courses: {data?.courses.length}
            </Typography>
          </div>
          <Button onClick={() => setIsOpen(true)}>
            <PlusIcon className="mr-2"></PlusIcon>
            Create a course
          </Button>
        </div>
        {isOpen && (
          <PaperContainer>
            <CourseForm setIsOpen={setIsOpen} />
          </PaperContainer>
        )}
        {isLoading ? (
          <Spinner></Spinner>
        ) : isError ? (
          <>Error</>
        ) : (
          <CoursesShowcase data={data.courses}></CoursesShowcase>
        )}
      </div>
    </div>
  );
};

export default Courses;
