import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  name: z.string().nonempty(),
  price: z.string().nonempty(),
});

type CoursesFormValues = z.infer<typeof formSchema>;

const CourseForm = ({ setIsOpen }: { setIsOpen: (val: boolean) => void }) => {
  const [loading, setLoading] = useState(false);

  const form = useForm({ defaultValues: { name: "", price: "" } });
  const createCourseMutation = api.courses.createCourse.useMutation();
  const trpcUtils = api.useContext();
  const { toast } = useToast();

  const onSubmit = (data: CoursesFormValues) => {
    const dataWithNumber = {
      name: data.name,
      price: Number(data.price)
    }

    setLoading(true);
    createCourseMutation.mutate(dataWithNumber, {
      onSuccess: ({ course }) => {
        toast({
          variant: "success",
          description: `Your new course (${course.name}) is ready!`
        });
        trpcUtils.courses.invalidate();
        setLoading(false);
      },
      onError: () => {
        toast({
          variant: "destructive",
          description: "somthing went wrong!"
        });
        setLoading(false);
      },
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between p-4">
        <div>Create course</div>
        <Button variant={"x"} onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
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
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="p-4">
                <FormLabel>Course Price</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="EX. 9999 is EGP 99.99" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator />
          <div className="flex w-full justify-end gap-4 self-end p-4">
            <Button
              disabled={loading}
              customeColor="destructive"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button
              disabled={loading}
              customeColor="secondary"
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

export default CourseForm;
