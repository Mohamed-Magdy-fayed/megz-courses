import AppLayout from "@/layouts/AppLayout";
import { useState } from "react";
import { api } from "@/lib/api";
import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { IconButton, Typography } from "@mui/material";
import { Button } from "@/components/ui/button";
import { Edit, Edit2, PlusIcon, Trash, X } from "lucide-react";
import { PaperContainer } from "@/components/ui/PaperContainers";
import Spinner from "@/components/Spinner";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useToastStore } from "@/zustand/store";
import { z } from "zod";
import { Course, Level } from "@prisma/client";
import { useRouter } from "next/router";

const ContentPage = () => {
  return (
    <AppLayout>
      <Courses />
    </AppLayout>
  );
};

export default ContentPage;

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

const formSchema = z.object({
  name: z.string().nonempty(),
});

type CoursesFormValues = z.infer<typeof formSchema>;

const CourseForm = ({ setIsOpen }: { setIsOpen: (val: boolean) => void }) => {
  const [loading, setLoading] = useState(false);

  const form = useForm({ defaultValues: { name: "" } });
  const createCourseMutation = api.courses.createCourse.useMutation();
  const trpcUtils = api.useContext();
  const toast = useToastStore();

  const onSubmit = (data: CoursesFormValues) => {
    setLoading(true);
    createCourseMutation.mutate(data, {
      onSuccess: ({ course }) => {
        toast.success(`Your new course (${course.name}) is ready!`);
        trpcUtils.courses.invalidate();
        setLoading(false);
      },
      onError: () => {
        toast.error("somthing went wrong!");
        setLoading(false);
      },
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between p-4">
        <div>Create course</div>
        <IconButton onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </IconButton>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="p-4">
                <FormLabel>Course Name</FormLabel>
                <FormControl>
                  <Input placeholder="Begginers Course" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator />
          <div className="flex w-full justify-end gap-4 self-end p-4">
            <Button
              disabled={loading}
              variant="destructive"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button
              disabled={loading}
              variant="secondary"
              type="reset"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
            <Button disabled={loading} type="submit">
              Create Course
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

const CoursesShowcase = ({
  data,
}: {
  data: (Course & {
    levels: Level[];
  })[];
}) => {
  const deleteCourseMutation = api.courses.deleteCourses.useMutation();
  const trpcUtils = api.useContext();
  const toast = useToastStore();
  const router = useRouter();

  const handleDelete = (id: string) => {
    console.log("delete", id);
    deleteCourseMutation.mutate([id], {
      onSuccess: () => {
        toast.success(`Deleted!`);
        trpcUtils.courses.invalidate();
      },
      onError: () => {
        toast.error("an error occured!");
      },
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data.map((course) => (
        <div key={course.id}>
          <PaperContainer>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <Typography>{course.name}</Typography>
                <IconButton
                  onClick={() => router.push(`/content/courses/${course.id}`)}
                >
                  <Edit2 className="h-4 w-4" />
                </IconButton>
              </div>
              <IconButton
                className="text-error hover:bg-red-100"
                onClick={() => handleDelete(course.id)}
              >
                <Trash className="h-4 w-4" />
              </IconButton>
            </div>
            <Separator />
            {course.levels.length === 0 && (
              <div className="p-4">
                <Typography>No levels added yet</Typography>
              </div>
            )}
            {course.levels.map((level) => (
              <div key={level.id}>
                <div>{level.name}</div>
                <div>{level.code}</div>
              </div>
            ))}
            <Separator />
            <div className="flex w-full p-4">
              <Button
                variant="ghost"
                className="ml-auto"
                onClick={() => router.push(`/content/courses/${course.id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Configure levels
              </Button>
            </div>
          </PaperContainer>
        </div>
      ))}
    </div>
  );
};
