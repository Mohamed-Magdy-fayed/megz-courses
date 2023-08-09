import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { IconButton, Typography } from "@mui/material";
import { Plus, Trash, X } from "lucide-react";
import React, { FC, useState } from "react";
import { AnswerCard, useToastStore } from "@/zustand/store";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";
import { useForm } from "react-hook-form";
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
import MaterialImageUpload from "../../ui/MaterialImageUpload";
import _, { uniqueId } from "lodash";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

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

type MaterialsFormValues = z.infer<typeof formSchema>;

const MaterialsForm = ({
  setIsOpen,
  id,
}: {
  setIsOpen: (val: boolean) => void;
  id: string;
}) => {
  const [loading, setLoading] = useState(false);
  const [answerCardText, setAnswerCardText] = useState("");
  const [selectCards, setSelectCards] = useState<
    { id: string; text: string }[]
  >([]);
  const [answerArea, setAnswerArea] = useState<{
    img: string;
    card: AnswerCard | null;
    correctAnswer: string;
  }>({
    img: "",
    card: null,
    correctAnswer: "",
  });

  const form = useForm<MaterialsFormValues>({
    defaultValues: {
      answerAreas: [],
      answerCards: [],
      firstTestTitle: "",
      leadinImageUrl: "",
      leadinText: "",
      practiceQuestions: [],
      subTitle: "",
      title: "",
      vocabularyCards: [],
    },
  });
  const createMaterialMutation = api.materials.createMaterialItem.useMutation();
  const trpcUtils = api.useContext();
  const toast = useToastStore();

  const onSubmit = (data: MaterialsFormValues) => {
    setLoading(true);

    createMaterialMutation.mutate(
      { ...data, lessonId: id },
      {
        onSuccess: ({ materialItem }) => {
          toast.success(`Your new material (${materialItem.title}) is ready!`);
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

  const handleAddVocabulary = (card: {
    word: string;
    context: string;
    example: string;
    images: {
      front: string;
      back: string;
    };
  }) => {
    form.setValue("vocabularyCards", [
      ...form.getValues().vocabularyCards,
      card,
    ]);
  };

  const handleAddPracticeQuestion = (question: PracticeQuestion) => {
    form.setValue("practiceQuestions", [
      ...form.getValues().practiceQuestions,
      question,
    ]);
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
              <FormItem className="p-4">
                <FormLabel>Answer Cards</FormLabel>
                <div className="flex flex-col">
                  {form.getValues().answerCards.map((card, i) => (
                    <div
                      className="flex items-center justify-between"
                      key={card.id}
                    >
                      <Typography>
                        {i + 1}
                        {" - "}
                        {card.text}
                      </Typography>
                      <Button
                        onClick={() =>
                          field.onChange(
                            form
                              .getValues()
                              .answerCards.filter((c) => c.id !== card.id)
                          )
                        }
                        variant="x"
                      >
                        <Trash />
                      </Button>
                    </div>
                  ))}
                </div>
                <FormControl>
                  <FormItem className="p-4">
                    <FormLabel>Text</FormLabel>
                    <FormControl>
                      <div className="flex items-center justify-between gap-4">
                        <Input
                          placeholder="Card text"
                          value={answerCardText}
                          onChange={(e) => setAnswerCardText(e.target.value)}
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            const card = {
                              id: uniqueId("#id-9550"),
                              text: answerCardText,
                            };
                            setSelectCards((prev) => [...prev, card]);
                            field.onChange([...field.value, card]);
                          }}
                          variant="secondary"
                          className="whitespace-nowrap"
                        >
                          <Plus />
                          <Typography>Add Card</Typography>
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>Add cards to select from</FormDescription>
                    <FormMessage />
                  </FormItem>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="answerAreas"
            render={({ field }) => (
              <FormItem className="p-4">
                <FormLabel>Answer Areas</FormLabel>
                <div className="flex flex-col">
                  {form.getValues().answerAreas.map((area, i) => (
                    <div className="flex items-center justify-between" key={i}>
                      <img
                        src={area.img}
                        alt={area.correctAnswer}
                        className="w-40"
                      />
                      <Typography>
                        {"For answer: "}
                        {area.correctAnswer}
                      </Typography>
                      <Button
                        onClick={() =>
                          field.onChange(
                            form
                              .getValues()
                              .answerAreas.filter(
                                (a) => a.correctAnswer !== area.correctAnswer
                              )
                          )
                        }
                        variant="x"
                      >
                        <Trash />
                      </Button>
                    </div>
                  ))}
                </div>
                <FormItem>
                  <FormLabel>Answer Image</FormLabel>
                  <FormControl>
                    <MaterialImageUpload
                      value={answerArea.img}
                      disabled={loading}
                      onChange={(url) =>
                        setAnswerArea((prev) => ({ ...prev, img: url }))
                      }
                      onRemove={() =>
                        setAnswerArea((prev) => ({ ...prev, img: "" }))
                      }
                    />
                  </FormControl>
                </FormItem>
                <FormControl>
                  <FormItem className="p-4">
                    <FormLabel>Correct Answer</FormLabel>
                    <Select
                      disabled={loading}
                      value={answerArea.correctAnswer}
                      // @ts-ignore
                      onValueChange={(e) =>
                        setAnswerArea((prev) => ({
                          ...prev,
                          correctAnswer: e,
                        }))
                      }
                    >
                      <FormControl>
                        <div className="flex items-center justify-between gap-4">
                          <SelectTrigger className="pl-8">
                            <SelectValue placeholder="Select the correct answer" />
                          </SelectTrigger>
                          <Button
                            type="button"
                            onClick={() => {
                              if (answerArea.img.length === 0) return;
                              if (answerArea.correctAnswer.length === 0) return;
                              field.onChange([...field.value, answerArea]);
                              setAnswerArea({
                                img: "",
                                card: null,
                                correctAnswer: "",
                              });
                            }}
                            variant="secondary"
                            className="whitespace-nowrap"
                          >
                            <Plus />
                            <Typography>Add Area</Typography>
                          </Button>
                        </div>
                      </FormControl>
                      <SelectContent>
                        {selectCards
                          .filter(
                            (c) =>
                              form
                                .getValues()
                                .answerAreas.filter(
                                  (a) => a.correctAnswer === c.text
                                ).length === 0
                          )
                          .map((card) => (
                            <SelectItem key={card.id} value={card.text}>
                              {card.text}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator />
          <FormField
            control={form.control}
            name="vocabularyCards"
            render={({ field }) => (
              <FormItem className="p-4">
                <FormLabel>Vocabulary Cards</FormLabel>
                <div className="flex flex-col">
                  {field.value.map((vocabCard, i) => (
                    <div className="flex items-center justify-between">
                      <Typography>
                        {"Word "}
                        {i + 1}
                        {"- "}
                        {vocabCard.word}
                      </Typography>
                      <Button
                        onClick={() =>
                          field.onChange(
                            form
                              .getValues()
                              .vocabularyCards.filter(
                                (c) => c.word !== vocabCard.word
                              )
                          )
                        }
                        variant="x"
                      >
                        <Trash />
                      </Button>
                    </div>
                  ))}
                </div>
                <FormControl>
                  <VocabularyCardsController
                    handleAddVocabulary={handleAddVocabulary}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator />
          <FormField
            control={form.control}
            name="practiceQuestions"
            render={({ field }) => (
              <FormItem className="p-4">
                <FormLabel>Practice Questions</FormLabel>
                <div className="flex flex-col">
                  {field.value.map((question, i) => (
                    <div className="flex items-center justify-between">
                      <Typography>
                        {" "}
                        {"Question "}
                        {i + 1}
                        {"- "}
                        {question.question}
                      </Typography>
                      <Button
                        onClick={() =>
                          field.onChange(
                            form
                              .getValues()
                              .practiceQuestions.filter(
                                (q) => q.id !== question.id
                              )
                          )
                        }
                        variant="x"
                      >
                        <Trash />
                      </Button>
                    </div>
                  ))}
                </div>
                <FormControl>
                  <PracticeQuestionsController
                    handleAddPracticeQuestion={handleAddPracticeQuestion}
                  />
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

export default MaterialsForm;

interface AnswerCardFieldProps {
  handleAddVocabulary: (card: {
    word: string;
    context: string;
    example: string;
    images: {
      front: string;
      back: string;
    };
  }) => void;
}

interface VocabCard {
  word: string;
  context: string;
  example: string;
  front: string;
  back: string;
}

const VocabularyCardsController: FC<AnswerCardFieldProps> = ({
  handleAddVocabulary,
}) => {
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState<VocabCard>({
    word: "",
    context: "",
    example: "",
    front: "",
    back: "",
  });

  const changeHandler = (value: string, key: string) => {
    setCard((prev) => {
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  return (
    <div className="">
      <FormItem className="p-4">
        <FormLabel>Vocabulary Context</FormLabel>
        <FormControl>
          <Input
            placeholder="How to greet?"
            value={card.context}
            onChange={(e) => changeHandler(e.target.value, "context")}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
      <FormItem className="p-4">
        <FormLabel>Vocabulary Example</FormLabel>
        <FormControl>
          <Input
            placeholder="Hello there!"
            value={card.example}
            onChange={(e) => changeHandler(e.target.value, "example")}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
      <FormItem className="md:col-span-2">
        <FormLabel>Card front image</FormLabel>
        <FormControl>
          <MaterialImageUpload
            value={card.front}
            disabled={loading}
            onChange={(url) => changeHandler(url, "front")}
            onRemove={() => changeHandler("", "front")}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
      <FormItem className="md:col-span-2">
        <FormLabel>Card back image</FormLabel>
        <FormControl>
          <MaterialImageUpload
            value={card.back}
            disabled={loading}
            onChange={(url) => changeHandler(url, "back")}
            onRemove={() => changeHandler("", "back")}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
      <FormItem className="p-4">
        <FormLabel>Vocabulary Word</FormLabel>
        <div className="flex items-center justify-between gap-4">
          <FormControl>
            <Input
              placeholder="Hello"
              value={card.word}
              onChange={(e) => changeHandler(e.target.value, "word")}
            />
          </FormControl>
          <Button
            type="button"
            onClick={() =>
              handleAddVocabulary({
                word: card.word,
                context: card.context,
                example: card.example,
                images: {
                  front: card.front,
                  back: card.back,
                },
              })
            }
            variant="ghost"
            className="whitespace-nowrap"
          >
            <Plus /> Add word
          </Button>
        </div>
        <FormMessage />
      </FormItem>
    </div>
  );
};

interface PracticeQuestion {
  id: string;
  question: string;
  choices: string[];
  correctAnswer: string;
  studentAnswer: string;
}

interface PracticeQuestionsControllerProps {
  handleAddPracticeQuestion: (question: PracticeQuestion) => void;
}

const PracticeQuestionsController: FC<PracticeQuestionsControllerProps> = ({
  handleAddPracticeQuestion,
}) => {
  const [loading, setLoading] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [question, setQuestion] = useState<PracticeQuestion>({
    id: "",
    choices: [],
    correctAnswer: "",
    question: "",
    studentAnswer: "",
  });

  const changeHandler = (value: string | string[], key: string) => {
    setQuestion((prev) => {
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  return (
    <div className="">
      <FormItem className="p-4">
        <FormLabel>Question Text</FormLabel>
        <FormControl>
          <Input
            placeholder="What is this?"
            value={question.question}
            onChange={(e) => changeHandler(e.target.value, "question")}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
      <FormItem className="p-4">
        <FormLabel>Question answers</FormLabel>
        <div className="flex flex-col">
          {question.choices.map((c, i) => (
            <Typography>
              {"Option "}
              {i + 1}
              {"- "}
              {c}
            </Typography>
          ))}
        </div>
        <FormControl>
          <div className="flex items-center justify-between gap-4">
            <Input
              placeholder="Hello there!"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
            <Button
              variant="ghost"
              className="whitespace-nowrap"
              type="button"
              onClick={() =>
                changeHandler([...question.choices, questionText], "choices")
              }
            >
              <Plus></Plus>Add option
            </Button>
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
      <FormItem className="p-4">
        <FormLabel>Correct Answer</FormLabel>
        <Select
          disabled={loading}
          value={question.correctAnswer}
          // @ts-ignore
          onValueChange={(e) =>
            setQuestion((prev) => ({
              ...prev,
              correctAnswer: e,
            }))
          }
        >
          <FormControl>
            <div className="flex items-center justify-between gap-4">
              <SelectTrigger className="pl-8">
                <SelectValue placeholder="Select the correct answer" />
              </SelectTrigger>
              <Button
                type="button"
                onClick={() => {
                  if (question.correctAnswer.length === 0) return;
                  handleAddPracticeQuestion(question);
                  setQuestion({
                    id: uniqueId("#Qid-5009"),
                    choices: [],
                    correctAnswer: "",
                    question: "",
                    studentAnswer: "",
                  });
                  setQuestionText("");
                }}
                variant="secondary"
                className="whitespace-nowrap"
              >
                <Plus />
                <Typography>Add Question</Typography>
              </Button>
            </div>
          </FormControl>
          <FormDescription>Add answers to select from</FormDescription>
          <SelectContent>
            {question.choices.map((choice) => (
              <SelectItem key={choice} value={choice}>
                {choice}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    </div>
  );
};
