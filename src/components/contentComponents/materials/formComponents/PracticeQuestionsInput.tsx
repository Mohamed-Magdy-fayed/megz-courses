import { FC, useState } from "react";
import { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import PracticeQuestionsController, {
  PracticeQuestion,
} from "./PracticeQuestionsController";
import { cn } from "@/lib/utils";
import { Typography } from "@/components/ui/Typoghraphy";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MaterialsFormValues } from "../MaterialsForm";

interface AnswerAreaInputProps {
  field: ControllerRenderProps<MaterialsFormValues, "practiceQuestions">;
  form: UseFormReturn<MaterialsFormValues, any, undefined>;
}

const PracticeQuestionsInput: FC<AnswerAreaInputProps> = ({ field, form }) => {
  const [edit, setEdit] = useState<PracticeQuestion>({
    studentAnswer: "",
    choices: [],
    correctAnswer: "",
    id: "",
    question: "",
  });

  const handleAddPracticeQuestion = (question: PracticeQuestion) => {
    form.setValue("practiceQuestions", [
      ...form.getValues().practiceQuestions,
      question,
    ]);
  };

  return (
    <FormItem className="p-4">
      <FormLabel>Practice Questions</FormLabel>
      <div className="flex flex-col">
        {field.value.map((question, i) => (
          <div
            className="flex items-center justify-between"
            key={`practiceQuestions.field${i}`}
          >
            <Typography
              className={cn("", question.id === edit.id && "text-warning")}
            >
              {i + 1}
              {"- "}
              {question.question}
            </Typography>
            <div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={"icon"}
                    customeColor={"infoIcon"}
                    onClick={() => {
                      setEdit(question);
                      field.onChange([
                        ...form
                          .getValues()
                          .practiceQuestions.filter((q) => q.id !== question.id),
                      ]);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Edit
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={"icon"}
                    customeColor={"destructiveIcon"}
                    onClick={() =>
                      field.onChange(
                        form
                          .getValues()
                          .practiceQuestions.filter((q) => q.id !== question.id)
                      )
                    }
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Delete
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>
      <FormControl>
        <PracticeQuestionsController
          edit={edit}
          handleAddPracticeQuestion={handleAddPracticeQuestion}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

export default PracticeQuestionsInput;
