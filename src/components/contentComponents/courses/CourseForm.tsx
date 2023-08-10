import { useState } from "react";
import { api } from "@/lib/api";
import { IconButton } from "@mui/material";
import { Button } from "@/components/ui/button";
import { PlusIcon, X } from "lucide-react";
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
import { useToastStore, useTutorialStore } from "@/zustand/store";
import { z } from "zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import router from "next/router";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().nonempty(),
});

type CoursesFormValues = z.infer<typeof formSchema>;

const CourseForm = ({ setIsOpen }: { setIsOpen: (val: boolean) => void }) => {
  const [loading, setLoading] = useState(false);
  const { skipTutorial, steps, setStep, setSkipTutorial } = useTutorialStore();

  const form = useForm({ defaultValues: { name: "" } });
  const createCourseMutation = api.courses.createCourse.useMutation();
  const trpcUtils = api.useContext();
  const toast = useToastStore();

  const onSubmit = (data: CoursesFormValues) => {
    setStep(true, "confirmCreateCourse");
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
            <Popover
              open={
                !steps.confirmCreateCourse &&
                !skipTutorial &&
                steps.createCourse &&
                router.route === "/content"
              }
            >
              <PopoverTrigger asChild>
                <Button
                  disabled={loading}
                  type="submit"
                  className={cn(
                    "",
                    !steps.confirmCreateCourse &&
                      !skipTutorial &&
                      steps.createCourse &&
                      router.route === "/content" &&
                      "tutorial-ping"
                  )}
                >
                  Create Course
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom">
                Fill in the data and click here!
              </PopoverContent>
            </Popover>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CourseForm;
