import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ImagePlus, X } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/ui/ImageUpload";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

const formSchema = z.object({
  name: z.string().nonempty(),
  description: z.string().nonempty(),
  image: z.string().nonempty(),
  price: z.string().nonempty(),
  form: z.string().nonempty(),
  oralTest: z.string().nonempty(),
});

type CoursesFormValues = z.infer<typeof formSchema>;

const CourseForm = ({ setIsOpen }: { setIsOpen: (val: boolean) => void }) => {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      image: "",
      price: "",
      form: "",
      oralTest: "",
    }
  });
  const createCourseMutation = api.courses.createCourse.useMutation();
  const trpcUtils = api.useContext();
  const { toastError, toastSuccess } = useToast();

  const onSubmit = ({ form, name, oralTest, price, description, image }: CoursesFormValues) => {
    setLoading(true);
    createCourseMutation.mutate({
      name: name,
      description: description,
      image: image,
      price: Number(price),
      form,
      oralTest
    }, {
      onSuccess: ({ course }) => {
        toastSuccess(`Your new course (${course.name}) is ready!`);
        trpcUtils.courses.invalidate();
        setLoading(false);
      },
      onError: (error) => {
        toastError(error.message)
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
            name="image"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormControl>
                  <ImageUpload
                    value={field.value}
                    disabled={loading}
                    onChange={(url) => field.onChange(url)}
                    onRemove={() => field.onChange("")}
                    customeImage={
                      form.getValues().image ? (
                        <Image width={240} height={160} src={form.getValues().image} alt="course image" />
                      ) : (
                        <Skeleton className="w-60 h-40 grid place-content-center">
                          <ImagePlus />
                        </Skeleton>
                      )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            name="description"
            render={({ field }) => (
              <FormItem className="p-4">
                <FormLabel>Course Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="What to learn from it?" {...field} />
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
          <FormField
            control={form.control}
            name="form"
            render={({ field }) => (
              <FormItem className="p-4">
                <FormLabel>Placement test form embedder</FormLabel>
                <FormControl>
                  <Input placeholder={`<iframe src="url"></iframe>`} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="oralTest"
            render={({ field }) => (
              <FormItem className="p-4">
                <FormLabel>Oral test questions doc</FormLabel>
                <FormControl>
                  <Input placeholder="doc url" {...field} />
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
