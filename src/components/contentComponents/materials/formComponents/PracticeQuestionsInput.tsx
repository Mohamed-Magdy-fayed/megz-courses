import { FC, useState } from "react";
import { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { MaterialsFormValues } from "../MaterialsEditForm";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { IconButton, Tooltip, Typography } from "@mui/material";
import { Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import PracticeQuestionsController, {
  PracticeQuestion,
} from "./PracticeQuestionsController";
import { cn } from "@/lib/utils";

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
              <Tooltip title="Edit">
                <IconButton
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
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  onClick={() =>
                    field.onChange(
                      form
                        .getValues()
                        .practiceQuestions.filter((q) => q.id !== question.id)
                    )
                  }
                  className="text-error hover:bg-red-100"
                >
                  <Trash className="h-4 w-4" />
                </IconButton>
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
