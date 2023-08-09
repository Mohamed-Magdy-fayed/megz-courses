import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useState } from "react";
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
import MaterialImageUpload from "../../ui/MaterialImageUpload";
import AnswerCardsInput from "./formComponents/AnswerCardsInput";
import AnswerAreaInput from "./formComponents/AnswerAreaInput";
import VocabCardsInput from "./formComponents/VocabCardsInput";
import PracticeQuestionsInput from "./formComponents/PracticeQuestionsInput";
import { IconButton, Tooltip } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";

const formSchema = z.object({
  leadinText: z.string(),
  leadinImageUrl: z.string(),
  firstTestTitle: z.string(),
  title: z.string(),
  subTitle: z.string(),
  answerCards: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
    })
  ),
  answerAreas: z.array(
    z.object({
      img: z.string(),
      card: z
        .object({
          id: z.string(),
          text: z.string(),
        })
        .nullable(),
      correctAnswer: z.string(),
    })
  ),
  vocabularyCards: z.array(
    z.object({
      word: z.string(),
      context: z.string(),
      example: z.string(),
      images: z.object({ front: z.string(), back: z.string() }),
    })
  ),
  practiceQuestions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      choices: z.array(z.string()),
      correctAnswer: z.string(),
      studentAnswer: z.string(),
    })
  ),
});

export type MaterialsFormValues = z.infer<typeof formSchema>;

const MaterialsForm = ({ materialId }: { materialId: string }) => {
  const { data } = api.materials.getById.useQuery({ id: materialId });
  const [loading, setLoading] = useState(false);
  const [selectCards, setSelectCards] = useState<
    { id: string; text: string }[]
  >([]);

  const {
    leadinText,
    leadinImageUrl,
    title,
    subTitle,
    firstTestTitle,
    answerCards,
    answerAreas,
    vocabularyCards,
    practiceQuestions,
  } = data?.materialItem!;

  const form = useForm<MaterialsFormValues>({
    defaultValues: {
      answerAreas,
      answerCards,
      firstTestTitle,
      leadinImageUrl,
      leadinText,
      practiceQuestions,
      subTitle,
      title,
      vocabularyCards,
    },
  });
  const editMaterialMutation = api.materials.editMaterialItem.useMutation();
  const trpcUtils = api.useContext();
  const router = useRouter();
  const toast = useToastStore();

  const onSubmit = (data: MaterialsFormValues) => {
    setLoading(true);

    editMaterialMutation.mutate(
      { ...data, id: materialId },
      {
        onSuccess: ({ updatedmaterialItem }) => {
          toast.success(
            `Your material (${updatedmaterialItem.title}) is updated!`
          );
          trpcUtils.materials.invalidate().then(() => setLoading(false));
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
      <div className="flex items-center gap-4 p-4">
        <Tooltip title="Go back">
          <IconButton onClick={() => router.back()}>
            <ArrowLeft className="text-primary" />
          </IconButton>
        </Tooltip>
        <div>Edit material</div>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="p-4">
                <FormLabel>Material Title</FormLabel>
                <FormControl>
                  <Input placeholder="Vocab, Grammar, ...etc" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subTitle"
            render={({ field }) => (
              <FormItem className="p-4">
                <FormLabel>Material Subtitle</FormLabel>
                <FormControl>
                  <Input placeholder="Subtitle" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="leadinText"
            render={({ field }) => (
              <FormItem className="p-4">
                <FormLabel>Leadin Text</FormLabel>
                <FormControl>
                  <Input placeholder="Welcome to the session" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="leadinImageUrl"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormControl>
                  <MaterialImageUpload
                    value={field.value}
                    disabled={loading}
                    onChange={(url) => field.onChange(url)}
                    onRemove={() => field.onChange("")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator />
          <FormField
            control={form.control}
            name="firstTestTitle"
            render={({ field }) => (
              <FormItem className="p-4">
                <FormLabel>First test title</FormLabel>
                <FormControl>
                  <Input placeholder="Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="answerCards"
            render={({ field }) => (
              <AnswerCardsInput
                field={field}
                form={form}
                setSelectCards={setSelectCards}
              />
            )}
          />
          <FormField
            control={form.control}
            name="answerAreas"
            render={({ field }) => (
              <AnswerAreaInput
                field={field}
                form={form}
                selectCards={selectCards}
              />
            )}
          />
          <Separator />
          <FormField
            control={form.control}
            name="vocabularyCards"
            render={({ field }) => (
              <VocabCardsInput field={field} form={form} />
            )}
          />
          <Separator />
          <FormField
            control={form.control}
            name="practiceQuestions"
            render={({ field }) => (
              <PracticeQuestionsInput field={field} form={form} />
            )}
          />
          <Separator />
          <div className="flex w-full justify-end gap-4 self-end p-4">
            <Button
              disabled={loading}
              variant="secondary"
              type="reset"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
            <Button disabled={loading} type="submit">
              Update Material
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default MaterialsForm;
