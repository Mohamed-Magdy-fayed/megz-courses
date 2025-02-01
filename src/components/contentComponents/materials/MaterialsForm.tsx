import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import AnswerCardsInput from "./formComponents/AnswerCardsInput";
import AnswerAreaInput from "./formComponents/AnswerAreaInput";
import VocabCardsInput from "./formComponents/VocabCardsInput";
import PracticeQuestionsInput from "./formComponents/PracticeQuestionsInput";
import ImageUploader from "@/components/ui/ImageUploader";
import { Skeleton } from "@/components/ui/skeleton";

export const formSchema = z.object({
  leadinText: z.string(),
  leadinImageUrl: z.string(),
  firstTestTitle: z.string(),
  title: z.string(),
  subTitle: z.string(),
  sessionOrder: z.number(),
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

const MaterialsForm = ({
  onSubmit,
  setIsOpen,
  loading,
  form,
}: {
  onSubmit: (data: MaterialsFormValues) => void;
  setIsOpen?: (val: boolean) => void;
  loading: boolean;
  form: UseFormReturn<MaterialsFormValues>;
}) => {
  const [selectCards, setSelectCards] = useState<
    { id: string; text: string }[]
  >([]);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} >
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
          name="sessionOrder"
          render={({ field }) => (
            <FormItem className="p-4">
              <FormLabel>Session Order</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Session Order" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
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
            <FormItem className="p-4">
              <FormLabel>Leadin Image</FormLabel>
              <FormControl>
                <ImageUploader
                  disabled={loading}
                  value={field.value}
                  onChange={(url) => field.onChange(url)}
                  onLoading={setUploadingImage}
                  onRemove={() => field.onChange("")}
                  customeImage={field.value && field.value.length > 0 ? (
                    <div className="flex gap-4 rounded-md">
                      <img alt="user image" src={field.value} className="max-h-[72px]" />
                    </div>
                  ) : (
                    <Skeleton className="h-[72px] w-[128px] rounded-md" />
                  )}
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
          {setIsOpen && (
            <Button
              disabled={loading}
              customeColor="destructive"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              Cancel
            </Button>
          )}
          <Button
            disabled={loading}
            customeColor="accent"
            type="reset"
            onClick={() => form.reset()}
          >
            Reset
          </Button>
          <Button disabled={loading || uploadingImage} type="submit">
            Create Material
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MaterialsForm;
