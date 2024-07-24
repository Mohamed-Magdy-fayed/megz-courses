import { Dispatch, SetStateAction, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ImagePlus, X } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import ImageUploader from "@/components/ui/ImageUploader";
import { z } from "zod";
import SelectField from "@/components/salesOperation/SelectField";

const formSchema = z.object({
  name: z.string().min(1, "Name can't be empty"),
  slug: z.string().min(1, "Please add a slug").regex(/^\S*$/, "No spaces allowed"),
  description: z.string().min(1, "description can't be empty"),
  image: z.string().min(1, "image can't be empty"),
  groupPrice: z.number().min(1, "groupPrice can't be empty"),
  privatePrice: z.number().min(1, "privatePrice can't be empty"),
  instructorPrice: z.number().min(1, "instructorPrice can't be empty"),
});

type CoursesFormValues = z.infer<typeof formSchema>;

const CourseForm = ({ initialData, setIsOpen }: {
  initialData?: CoursesFormValues & {
    id: string;
  };
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingToast, setLoadingToast] = useState<ReturnType<typeof toast>>()

  const { toast } = useToast()

  const form = useForm<CoursesFormValues>({
    defaultValues: initialData
      ? initialData
      : {
        name: "",
        slug: "",
        description: "",
        image: "",
        groupPrice: 0,
        instructorPrice: 0,
        privatePrice: 0,
      }
  });
  const createCourseMutation = api.courses.createCourse.useMutation({
    onMutate: () => {
      setLoadingToast(toast({
        title: "Loading...",
        duration: 3000,
        variant: "info",
      }))
      setLoading(true)
    },
    onSuccess: ({ course }) => trpcUtils.courses.invalidate()
      .then(() => {
        loadingToast?.update({
          id: loadingToast.id,
          title: "Success",
          description: `Course ${course.name} created successfully`,
          variant: "success",
        })
        setIsOpen(false)
      }),
    onError: ({ message }) => loadingToast?.update({
      id: loadingToast.id,
      title: "Error",
      description: message,
      variant: "destructive",
    }),
    onSettled: () => setLoading(false)
  });

  const editCourseMutation = api.courses.editCourse.useMutation({
    onMutate: () => {
      setLoadingToast(toast({
        title: "Loading...",
        duration: 3000,
        variant: "info",
      }))
      setLoading(true)
    },
    onSuccess: ({ updatedCourse }) => trpcUtils.courses.invalidate()
      .then(() => {
        loadingToast?.update({
          id: loadingToast.id,
          title: "Success",
          description: `updated ${updatedCourse.name} course successfully`,
          variant: "success",
        })
        setIsOpen(false)
      }),
    onError: ({ message }) => loadingToast?.update({
      id: loadingToast.id,
      title: "Error",
      description: message,
      variant: "destructive",
    }),
    onSettled: () => {
      setLoading(false)
      setTimeout(() => loadingToast?.dismiss(), 1000)
    },
  });
  const trpcUtils = api.useContext();

  const onSubmit = ({ name, slug, privatePrice, groupPrice, instructorPrice, description, image }: CoursesFormValues) => {
    initialData
      ? editCourseMutation.mutate({
        id: initialData.id,
        name,
        slug,
        description,
        groupPrice: Number(groupPrice),
        instructorPrice: Number(instructorPrice),
        privatePrice: Number(privatePrice),
        image,
      })
      : createCourseMutation.mutate({
        name: name,
        slug,
        description: description,
        image: image,
        privatePrice: Number(privatePrice),
        groupPrice: Number(groupPrice),
        instructorPrice: Number(instructorPrice),
      });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormControl>
                <ImageUploader
                  value={field.value}
                  disabled={loading}
                  onChange={(url) => field.onChange(url)}
                  onRemove={() => field.onChange("")}
                  customeImage={
                    form.getValues().image ? (
                      <Image width={240} height={160} src={form.getValues().image} alt="course image" />
                    ) : (
                      <Skeleton className="w-32 h-20 grid place-content-center">
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
          name="slug"
          render={({ field }) => (
            <FormItem className="p-4">
              <FormLabel>URL segment for this course</FormLabel>
              <FormControl>
                <Input placeholder="course_name (no spaces)" {...field} />
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
        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="privatePrice"
            render={({ field }) => (
              <FormItem className="p-4">
                <FormLabel>Private Price</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="EX. 99.99" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="groupPrice"
            render={({ field }) => (
              <FormItem className="p-4">
                <FormLabel>Group Price</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="EX. 99.99" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="instructorPrice"
            render={({ field }) => (
              <FormItem className="p-4">
                <FormLabel>Instructor Price</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="EX. 99.99" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
            {initialData ? "Submit" : "Create Course"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CourseForm;
