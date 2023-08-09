import { Button } from "@/components/ui/button";
import { FormItem, FormMessage, FormDescription } from "@/components/ui/form";
import { FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconButton, Tooltip, Typography } from "@mui/material";
import { uniqueId } from "lodash";
import { Plus, Trash } from "lucide-react";
import { FC, useEffect, useState } from "react";

export interface PracticeQuestion {
  id: string;
  question: string;
  choices: string[];
  correctAnswer: string;
  studentAnswer: string;
}

interface PracticeQuestionsControllerProps {
  edit: PracticeQuestion;
  handleAddPracticeQuestion: (question: PracticeQuestion) => void;
}

const PracticeQuestionsController: FC<PracticeQuestionsControllerProps> = ({
  handleAddPracticeQuestion,
  edit,
}) => {
  const [loading, setLoading] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [question, setQuestion] = useState<PracticeQuestion>(edit);

  const changeHandler = (value: string | string[], key: string) => {
    setQuestion((prev) => {
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  useEffect(() => setQuestion(edit), [edit]);

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
            <div
              className="flex items-center justify-between"
              key={`question.choice${i}`}
            >
              <Typography>
                {"Option "}
                {i + 1}
                {"- "}
                {c}
              </Typography>
              <Tooltip title="Delete">
                <IconButton
                  onClick={() =>
                    setQuestion((prev) => ({
                      ...prev,
                      choices: prev.choices.filter((choice) => c !== choice),
                    }))
                  }
                  className="text-error hover:bg-red-100"
                >
                  <Trash className="h-4 w-4" />
                </IconButton>
              </Tooltip>
            </div>
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
                  handleAddPracticeQuestion({
                    ...question,
                    id: edit.id.length > 0 ? edit.id : uniqueId("#Qid-5009"),
                  });
                  setQuestion({
                    id: "",
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

export default PracticeQuestionsController;
