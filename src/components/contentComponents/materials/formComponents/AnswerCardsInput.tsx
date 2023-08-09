import { Dispatch, FC, SetStateAction, useState } from "react";
import { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { MaterialsFormValues } from "../MaterialsEditForm";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { IconButton, Tooltip, Typography } from "@mui/material";
import { Edit, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uniqueId } from "lodash";
import { cn } from "@/lib/utils";

interface AnswerCardsInputProps {
  field: ControllerRenderProps<MaterialsFormValues, "answerCards">;
  form: UseFormReturn<MaterialsFormValues, any, undefined>;
  setSelectCards: Dispatch<SetStateAction<{ id: string; text: string }[]>>;
}

const AnswerCardsInput: FC<AnswerCardsInputProps> = ({
  field,
  form,
  setSelectCards,
}) => {
  const [answerCardText, setAnswerCardText] = useState("");
  const [edit, setEdit] = useState({ id: "", text: "" });

  return (
    <FormItem className="p-4">
      <FormLabel>Answer Cards</FormLabel>
      <div className="flex flex-col">
        {form.getValues().answerCards.map((card, i) => (
          <div className="flex items-center justify-between" key={card.id}>
            <Typography
              className={cn("", edit.id === card.id && "text-warning")}
            >
              {i + 1}
              {" - "}
              {card.text}
            </Typography>
            <div>
              <Tooltip title="Edit">
                <IconButton
                  onClick={() => {
                    setAnswerCardText(card.text);
                    setEdit(card);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Remove">
                <IconButton
                  onClick={() =>
                    field.onChange(
                      form
                        .getValues()
                        .answerCards.filter((c) => c.id !== card.id)
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
        <FormItem className="p-4">
          <FormLabel>Text</FormLabel>
          <FormControl>
            <div className="flex items-center justify-between gap-4">
              <Input
                placeholder="Card text"
                value={answerCardText}
                onChange={(e) => setAnswerCardText(e.target.value)}
              />
              {edit.id.length > 0 ? (
                <Button
                  type="button"
                  onClick={() => {
                    const card = {
                      id: edit.id,
                      text: answerCardText,
                    };

                    setSelectCards((prev) => [
                      ...prev.map((c) => (c.id === card.id ? card : c)),
                    ]);
                    field.onChange([
                      ...form
                        .getValues()
                        .answerCards.map((c) => (c.id === card.id ? card : c)),
                    ]);
                    setEdit({ id: "", text: "" });
                    setAnswerCardText("");
                  }}
                  variant="secondary"
                  className="whitespace-nowrap"
                >
                  <Plus />
                  <Typography>Update Card</Typography>
                </Button>
              ) : (
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
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

export default AnswerCardsInput;
