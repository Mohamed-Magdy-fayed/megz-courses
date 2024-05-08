import { useState } from "react";
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

const formSchema = z.object({
  name: z.string().min(1, "Name can't be empty"),
  description: z.string().min(1, "description can't be empty"),
  image: z.string().min(1, "image can't be empty"),
  groupPrice: z.string().min(1, "groupPrice can't be empty"),
  privatePrice: z.string().min(1, "privatePrice can't be empty"),
  instructorPrice: z.string().min(1, "instructorPrice can't be empty"),
  form: z.string().min(1, "form can't be empty"),
  oralTest: z.string().min(1, "oralTest can't be empty"),
  level: z.enum(validLevelTypes),
});

type CoursesFormValues = z.infer<typeof formSchema>;

const CourseForm = ({ setIsOpen }: { setIsOpen: (val: boolean) => void }) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<CoursesFormValues>({
    defaultValues: {
      name: "",
      description: "",
      image: "",
      groupPrice: "",
      instructorPrice: "",
      privatePrice: "",
      form: "",
      oralTest: "",
      level: "A0_A1_Beginner_Elementary",
    }
  });
  const createCourseMutation = api.courses.createCourse.useMutation();
  const trpcUtils = api.useContext();
  const { toastError, toastSuccess } = useToast();

  const onSubmit = ({ form, name, oralTest, privatePrice, groupPrice, instructorPrice, description, image, level }: CoursesFormValues) => {
    setLoading(true);
    createCourseMutation.mutate({
      name: name,
      description: description,
      image: image,
      privatePrice: Number(privatePrice),
      groupPrice: Number(groupPrice),
      instructorPrice: Number(instructorPrice),
      form,
      oralTest,
      level,
    }, {
      onSuccess: ({ course }) => {
        trpcUtils.courses.invalidate()
          .then(() => {
            toastSuccess(`Your new course (${course.name}) is ready!`);
            setIsOpen(false)
            setLoading(false);
          });
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
                  <ImageUploader
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
          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem className="p-4">
                <FormLabel>Oral test questions doc</FormLabel>
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
              Create Course
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CourseForm;
