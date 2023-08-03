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
import { MaterialItem } from "@prisma/client";
import { useToastStore } from "@/zustand/store";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const LessonPage = () => {
  const router = useRouter();
  const id = router.query.lessonId as string;
  const { data, isLoading, isError } = api.lessons.getById.useQuery({ id });
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <ConceptTitle>{data?.lesson?.name}</ConceptTitle>
            <Typography className="text-sm font-medium text-gray-500">
              total materials: {data?.lesson?.materials.length}
            </Typography>
          </div>
          <Button onClick={() => setIsOpen(true)}>
            <PlusIcon className="mr-2"></PlusIcon>
            Add material
          </Button>
        </div>
        {isOpen && (
          <PaperContainer>
            <MaterialsForm id={id} setIsOpen={setIsOpen} />
          </PaperContainer>
        )}
        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <>Error</>
        ) : !data.lesson?.materials ? (
          <>No materials yet</>
        ) : (
          <MaterialsShowcase data={data.lesson?.materials}></MaterialsShowcase>
        )}
      </div>
    </AppLayout>
  );
};

export default LessonPage;

const MaterialsShowcase = ({ data }: { data: MaterialItem[] }) => {
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
      {data.map((material) => (
        <div key={material.id}>
          <PaperContainer>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-2">
                  <Typography>{material.name}</Typography>
                </div>
                <IconButton
                  onClick={() =>
                    router.push(`/content/materials/${material.id}`)
                  }
                >
                  <Edit2 className="h-4 w-4" />
                </IconButton>
              </div>
              <IconButton
                className="text-error hover:bg-red-100"
                onClick={() => handleDelete(material.id)}
              >
                <Trash className="h-4 w-4" />
              </IconButton>
            </div>
            <Separator />
            <div className="flex w-full p-4">
              <Button
                variant="ghost"
                className="ml-auto"
                onClick={() =>
                  router.push(`/content/materials/${material.id}/show`)
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                Showcase
              </Button>
              <Button
                variant="ghost"
                className="ml-auto"
                onClick={() => router.push(`/content/materials/${material.id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Configure materials
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

type MaterialsFormValues = z.infer<typeof formSchema>;

const MaterialsForm = ({
  setIsOpen,
  id,
}: {
  setIsOpen: (val: boolean) => void;
  id: string;
}) => {
  const [loading, setLoading] = useState(false);

  const form = useForm({ defaultValues: { name: "" } });
  const creatematerialMutation = api.materials.createMaterialItem.useMutation();
  const trpcUtils = api.useContext();
  const toast = useToastStore();

  const onSubmit = (data: MaterialsFormValues) => {
    setLoading(true);

    creatematerialMutation.mutate(
      { ...data, lessonId: id, fileType: "10", size: "10", url: "asd" },
      {
        onSuccess: ({ materialItem }) => {
          toast.success(`Your new lesson (${materialItem.name}) is ready!`);
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
        <div>Create material</div>
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
                <FormLabel>Material Name</FormLabel>
                <FormControl>
                  <Input placeholder="Material 1" {...field} />
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
              Create Material
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
