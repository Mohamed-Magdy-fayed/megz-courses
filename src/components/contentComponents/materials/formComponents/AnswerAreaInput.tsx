import { FC, useState } from "react";
import { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { Edit, Loader, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import MaterialImageUpload from "@/components/ui/MaterialImageUpload";
import { AnswerCard } from "@prisma/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/Typoghraphy";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MaterialsFormValues } from "../MaterialsForm";
import ImageUploader from "@/components/ui/ImageUploader";

interface AnswerAreaInputProps {
  field: ControllerRenderProps<MaterialsFormValues, "answerAreas">;
  form: UseFormReturn<MaterialsFormValues, any, undefined>;
  selectCards: { id: string; text: string }[];
}

const AnswerAreaInput: FC<AnswerAreaInputProps> = ({
  field,
  form,
  selectCards,
}) => {
  const [loading, setLoading] = useState(false);
  const [answerArea, setAnswerArea] = useState<{
    img: string;
    card: AnswerCard | null;
    correctAnswer: string;
  }>({
    img: "",
    card: null,
    correctAnswer: "",
  });
  const [edit, setEdit] = useState<{
    img: string;
    card: AnswerCard | null;
    correctAnswer: string;
  }>({ img: "", card: null, correctAnswer: "" });

  return (
    <FormItem className="p-4">
      <FormLabel>Answer Areas</FormLabel>
      <div className="flex flex-col">
        {form.getValues().answerAreas.map((area, i) => (
          <div className="flex items-center justify-between" key={i}>
            {edit.correctAnswer === area.correctAnswer ? (
              <Skeleton className="grid h-32 w-40 place-content-center">
                <Loader className="animate-spin" />
              </Skeleton>
            ) : (
              <img src={area.img} alt={area.correctAnswer} className="w-40" />
            )}
            <Typography
              className={cn(
                "",
                edit.correctAnswer === area.correctAnswer && "text-warning"
              )}
            >
              {"For answer: "}
              {edit.correctAnswer === area.correctAnswer
                ? edit.correctAnswer
                : area.correctAnswer}
            </Typography>
            <div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={"icon"}
                    customeColor={"infoIcon"}
                    onClick={() => {
                      setEdit(area);
                      setAnswerArea(area);
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
                          .answerAreas.filter(
                            (a) => a.correctAnswer !== area.correctAnswer
                          )
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
      <FormItem>
        <FormLabel>Answer Image</FormLabel>
        <FormControl>
          <MaterialImageUpload
            value={answerArea.img}
            disabled={loading}
            onChange={(url) => setAnswerArea((prev) => ({ ...prev, img: url }))}
            onRemove={() => setAnswerArea((prev) => ({ ...prev, img: "" }))}
          />
        </FormControl>
      </FormItem>
      <FormControl>
        <FormItem className="p-4">
          <FormLabel>Correct Answer</FormLabel>
          {answerArea.correctAnswer}
          <Select
            disabled={loading}
            value={answerArea.correctAnswer}
            // @ts-ignore
            onValueChange={(e) => {
              setAnswerArea((prev) => ({
                ...prev,
                correctAnswer: e,
              }));
            }}
          >
            <FormControl>
              <div className="flex items-center justify-between gap-4">
                <SelectTrigger className="pl-8">
                  <SelectValue placeholder="Select the correct answer" />
                </SelectTrigger>
                {edit.correctAnswer.length > 0 ? (
                  <Button
                    type="button"
                    onClick={() => {
                      if (answerArea.img.length === 0) return;
                      field.onChange([
                        ...form
                          .getValues()
                          .answerAreas.map((a) =>
                            a.correctAnswer === edit.correctAnswer
                              ? answerArea
                              : a
                          ),
                      ]);
                      setAnswerArea({
                        img: "",
                        card: null,
                        correctAnswer: "",
                      });
                      setEdit({
                        img: "",
                        card: null,
                        correctAnswer: "",
                      });
                    }}
                    variant="outline"
                    customeColor="primaryOutlined"
                    className="whitespace-nowrap"
                  >
                    <Plus />
                    <Typography>Update Area</Typography>
                  </Button>
                ) : (
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
                    variant="outline"
                    customeColor="primaryOutlined"
                    className="whitespace-nowrap"
                  >
                    <Plus />
                    <Typography>Add Area</Typography>
                  </Button>
                )}
              </div>
            </FormControl>
            <FormDescription>Add cards to select from</FormDescription>
            <SelectContent>
              {form
                .getValues()
                .answerCards.filter(
                  (c) =>
                    form
                      .getValues()
                      .answerAreas.filter((a) => a.correctAnswer === c.text)
                      .length === 0 || c.text === edit.correctAnswer
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
  );
};

export default AnswerAreaInput;
