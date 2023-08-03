import Spinner from "@/components/Spinner";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/AppLayout";
import { api } from "@/lib/api";
import { IconButton, Typography } from "@mui/material";
import { Edit, Edit2, PlusIcon, Trash, X } from "lucide-react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { useToastStore } from "@/zustand/store";
import { Lesson, Level } from "@prisma/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";

const CoursePage = () => {
  const router = useRouter();
  const id = router.query.id as string;
  const { data, isLoading, isError } = api.courses.getById.useQuery({ id });
  const [isOpen, setIsOpen] = useState(false);
  console.log(data);

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <ConceptTitle>{data?.course?.name}</ConceptTitle>
            <Typography className="text-sm font-medium text-gray-500">
              total levels: {data?.course?.levels.length}
            </Typography>
          </div>
          <Button onClick={() => setIsOpen(true)}>
            <PlusIcon className="mr-2"></PlusIcon>
            Add a level
          </Button>
        </div>
        {isOpen && (
          <PaperContainer>
            <LevelForm id={id} setIsOpen={setIsOpen} />
          </PaperContainer>
        )}
        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <>Error</>
        ) : !data.course?.levels ? (
          <>No levels yet</>
        ) : (
          <LevelsShowcase data={data.course?.levels}></LevelsShowcase>
        )}
      </div>
    </AppLayout>
  );
};

export default CoursePage;

const LevelsShowcase = ({
  data,
}: {
  data: (Level & {
    lessons: Lesson[];
  })[];
}) => {
  const deleteLevelMutation = api.levels.deleteLevels.useMutation();
  const trpcUtils = api.useContext();
  const toast = useToastStore();
  const router = useRouter();

  const handleDelete = (id: string) => {
    deleteLevelMutation.mutate([id], {
      onSuccess: () => {
        toast.success(`Deleted!`);
        trpcUtils.levels.invalidate();
      },
      onError: () => {
        toast.error("an error occured!");
      },
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data.map((level) => (
        <div key={level.id}>
          <PaperContainer>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-2">
                  <Typography>{level.name}</Typography>
                  <Typography className="text-xs font-bold text-primary">
                    {level.code}
                  </Typography>
                </div>
                <IconButton
                  onClick={() => router.push(`/content/levels/${level.id}`)}
                >
                  <Edit2 className="h-4 w-4" />
                </IconButton>
              </div>
              <IconButton
                className="text-error hover:bg-red-100"
                onClick={() => handleDelete(level.id)}
              >
                <Trash className="h-4 w-4" />
              </IconButton>
            </div>
            <Separator />
            {level.lessons.length === 0 && (
              <div className="p-4">
                <Typography>No lessons added yet</Typography>
              </div>
            )}
            {level.lessons.map((lesson) => (
              <div key={lesson.id}>
                <div>{lesson.name}</div>
              </div>
            ))}
            <Separator />
            <div className="flex w-full p-4">
              <Button
                variant="ghost"
                className="ml-auto"
                onClick={() => router.push(`/content/levels/${level.id}`)}
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
  code: z.string().nonempty(),
});

type LevelFormValues = z.infer<typeof formSchema>;

const LevelForm = ({
  setIsOpen,
  id,
}: {
  setIsOpen: (val: boolean) => void;
  id: string;
}) => {
  const [loading, setLoading] = useState(false);

  const form = useForm({ defaultValues: { name: "", code: "" } });
  const createlevelMutation = api.levels.createLevel.useMutation();
  const trpcUtils = api.useContext();
  const toast = useToastStore();

  const onSubmit = (data: LevelFormValues) => {
    setLoading(true);
    createlevelMutation.mutate(
      { ...data, courseId: id },
      {
        onSuccess: ({ level }) => {
          toast.success(`Your new level (${level.name}) is ready!`);
          trpcUtils.levels.invalidate();
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
        <div>Create level</div>
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
                <FormLabel>level Name</FormLabel>
                <FormControl>
                  <Input placeholder="Level 1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem className="p-4">
                <FormLabel>Level Code</FormLabel>
                <FormControl>
                  <Input placeholder="L1" {...field} />
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
              Create Level
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
