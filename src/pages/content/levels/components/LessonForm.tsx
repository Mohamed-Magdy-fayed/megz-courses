import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { useToastStore } from "@/zustand/store";
import { IconButton } from "@mui/material";
import { X } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().nonempty(),
});

type LessonFormValues = z.infer<typeof formSchema>;

const LessonForm = ({
  setIsOpen,
  id,
}: {
  setIsOpen: (val: boolean) => void;
  id: string;
}) => {
  const [loading, setLoading] = useState(false);

  const form = useForm({ defaultValues: { name: "" } });
  const createLessonMutation = api.lessons.createLesson.useMutation();
  const trpcUtils = api.useContext();
  const toast = useToastStore();

  const onSubmit = (data: LessonFormValues) => {
    setLoading(true);

    createLessonMutation.mutate(
      { ...data, levelId: id },
      {
        onSuccess: ({ lesson }) => {
          toast.success(`Your new lesson (${lesson.name}) is ready!`);
          trpcUtils.lessons.invalidate();
          setLoading(false);
        },
        onError: () => {
          toast.error("somthing went wrong!");
          setLoading(false);
        },
      }
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between p-4">
        <div>Create lesson</div>
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
                <FormLabel>Lesson Name</FormLabel>
                <FormControl>
                  <Input placeholder="Level 1" {...field} />
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
              Create Lesson
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default LessonForm;
