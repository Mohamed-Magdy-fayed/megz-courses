import Spinner from "@/components/Spinner";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/layouts/AppLayout";
import { api } from "@/lib/api";
import { useToastStore } from "@/zustand/store";
import { IconButton, Typography } from "@mui/material";
import { Lesson, MaterialItem } from "@prisma/client";
import { Edit, Edit2, PlusIcon, Trash, X } from "lucide-react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const LevelPage = () => {
  const router = useRouter();
  const id = router.query.id as string;
  const { data, isLoading, isError } = api.levels.getById.useQuery({ id });
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <ConceptTitle>{data?.level?.name}</ConceptTitle>
            <Typography className="text-sm font-medium text-gray-500">
              Code: {data?.level?.code}
            </Typography>
            <Typography className="text-sm font-medium text-gray-500">
              total lessons: {data?.level?.lessons.length}
            </Typography>
          </div>
          <Button onClick={() => setIsOpen(true)}>
            <PlusIcon className="mr-2"></PlusIcon>
            Add a lesson
          </Button>
        </div>
        {isOpen && (
          <PaperContainer>
            <LessonForm id={id} setIsOpen={setIsOpen} />
          </PaperContainer>
        )}
        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <>Error</>
        ) : !data.level?.lessons ? (
          <>No materials yet</>
        ) : (
          <LessonsShowcase data={data.level?.lessons}></LessonsShowcase>
        )}
      </div>
    </AppLayout>
  );
};

export default LevelPage;

const LessonsShowcase = ({
  data,
}: {
  data: (Lesson & {
    materials: MaterialItem[];
  })[];
}) => {
  const deleteLessonsMutation = api.lessons.deleteLessons.useMutation();
  const trpcUtils = api.useContext();
  const toast = useToastStore();
  const router = useRouter();

  const handleDelete = (id: string) => {
    deleteLessonsMutation.mutate([id], {
      onSuccess: () => {
        toast.success(`Deleted!`);
        trpcUtils.lessons.invalidate();
      },
      onError: () => {
        toast.error("an error occured!");
      },
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data.map((lesson) => (
        <div key={lesson.id}>
          <PaperContainer>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-2">
                  <Typography>{lesson.name}</Typography>
                </div>
                <IconButton
                  onClick={() => router.push(`/content/lessons/${lesson.id}`)}
                >
                  <Edit2 className="h-4 w-4" />
                </IconButton>
              </div>
              <IconButton
                className="text-error hover:bg-red-100"
                onClick={() => handleDelete(lesson.id)}
              >
                <Trash className="h-4 w-4" />
              </IconButton>
            </div>
            <Separator />
            {lesson.materials.length === 0 && (
              <div className="p-4">
                <Typography>No materials added yet</Typography>
              </div>
            )}
            {lesson.materials.map((material) => (
              <div key={material.id}>
                <div>{material.name}</div>
              </div>
            ))}
            <Separator />
            <div className="flex w-full p-4">
              <Button
                variant="ghost"
                className="ml-auto"
                onClick={() => router.push(`/content/lessons/${lesson.id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Configure lessons
              </Button>
            </div>
          </PaperContainer>
        </div>
      ))}
    </div>
  );
};

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
            render={({ field }) => {
              return (
                <FormItem className="p-4">
                  <FormLabel>Lesson Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Level 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
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
