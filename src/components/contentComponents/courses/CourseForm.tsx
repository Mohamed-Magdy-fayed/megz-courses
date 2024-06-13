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
import { validLevelTypes } from "@/lib/enumsTypes";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Course } from "@prisma/client";

const formSchema = z.object({
  name: z.string().min(1, "Name can't be empty"),
  description: z.string().min(1, "description can't be empty"),
  image: z.string().min(1, "image can't be empty"),
  groupPrice: z.string().min(1, "groupPrice can't be empty"),
  privatePrice: z.string().min(1, "privatePrice can't be empty"),
  instructorPrice: z.string().min(1, "instructorPrice can't be empty"),
  oralTest: z.string().min(1, "oralTest can't be empty"),
  level: z.enum(validLevelTypes),
});

type CoursesFormValues = z.infer<typeof formSchema>;

const CourseForm = ({ initialData, setIsOpen }: { initialData?: Course, setIsOpen: Dispatch<SetStateAction<boolean>> }) => {
  const [loading, setLoading] = useState(false);
  const [loadingToast, setLoadingToast] = useState<ReturnType<typeof toast>>()
  const { toast } = useToast()

  const form = useForm<CoursesFormValues>({
    defaultValues: initialData
      ? {
        name: initialData.name,
        description: initialData.description || "",
        image: initialData.image || "",
        groupPrice: initialData.groupPrice.toString(),
        instructorPrice: initialData.instructorPrice.toString(),
        privatePrice: initialData.privatePrice.toString(),
        oralTest: initialData.oralTest,
        level: initialData.level,
      }
      : {
        name: "",
        description: "",
        image: "",
        groupPrice: "",
        instructorPrice: "",
        privatePrice: "",
        oralTest: "",
        level: "A0_A1_Beginner_Elementary",
      }
  });
  const createCourseMutation = api.courses.createCourse.useMutation({
    onMutate: () => {
      setLoadingToast(toast({
        title: "Loading...",
        duration: 30000,
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
          duration: 2000,
          variant: "success",
        })
        setIsOpen(false)
      }),
    onError: ({ message }) => loadingToast?.update({
      id: loadingToast.id,
      title: "Error",
      description: message,
      duration: 2000,
      variant: "destructive",
    }),
    onSettled: () => setLoading(false)
  });
  const editCourseMutation = api.courses.editCourse.useMutation({
    onMutate: () => {
      setLoadingToast(toast({
        title: "Loading...",
        duration: 30000,
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
          duration: 2000,
          variant: "success",
        })
        setIsOpen(false)
      }),
    onError: ({ message }) => loadingToast?.update({
      id: loadingToast.id,
      title: "Error",
      description: message,
      duration: 2000,
      variant: "destructive",
    }),
    onSettled: () => setLoading(false),
  });
  const trpcUtils = api.useContext();

  const onSubmit = ({ name, oralTest, privatePrice, groupPrice, instructorPrice, description, image, level }: CoursesFormValues) => {
    initialData
      ? editCourseMutation.mutate({
        id: initialData.id,
        name,
        oralTest,
        description,
        groupPrice: Number(groupPrice),
        instructorPrice: Number(instructorPrice),
        privatePrice: Number(privatePrice),
        image,
        level,
      })
      : createCourseMutation.mutate({
        name: name,
        description: description,
        image: image,
        privatePrice: Number(privatePrice),
        groupPrice: Number(groupPrice),
        instructorPrice: Number(instructorPrice),
        oralTest,
        level,
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
        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem className="p-4">
              <FormLabel>Course level</FormLabel>
              <FormControl>
                <Select
                  disabled={loading}
                  // @ts-ignore
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="pl-8 bg-white">
                      <SelectValue
                        defaultValue={field.value}
                        placeholder="Select Course Level"
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {validLevelTypes.map(level => (
                      <SelectItem id={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            {initialData ? "Submit" : "Create Course"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CourseForm;
