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
import VocabularyCardsController, {
  VocabCard,
} from "./VocabularyCardController";

interface VocabCardsInputProps {
  field: ControllerRenderProps<MaterialsFormValues, "vocabularyCards">;
  form: UseFormReturn<MaterialsFormValues, any, undefined>;
}

const VocabCardsInput: FC<VocabCardsInputProps> = ({ field, form }) => {
  const [edit, setEdit] = useState<VocabCard>({
    word: "",
    context: "",
    example: "",
    front: "",
    back: "",
  });

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
    setEdit({
      word: "",
      context: "",
      example: "",
      front: "",
      back: "",
    });
  };

  return (
    <FormItem className="p-4">
      <FormLabel>Vocabulary Cards</FormLabel>
      <div className="flex flex-col">
        {field.value.map((vocabCard, i) => (
          <div
            className="flex items-center justify-between"
            key={`vocabularyCards.field${i}`}
          >
            <Typography>
              {"Word "}
              {i + 1}
              {"- "}
              {vocabCard.word}
            </Typography>
            <div>
              <Tooltip title="Edit">
                <IconButton
                  onClick={() => {
                    const {
                      context,
                      example,
                      word,
                      images: { back, front },
                    } = vocabCard;
                    setEdit({ context, back, example, front, word });
                    field.onChange([
                      ...form
                        .getValues()
                        .vocabularyCards.filter((c) => c.word !== word),
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
                        .vocabularyCards.filter(
                          (c) => c.word !== vocabCard.word
                        )
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
        <VocabularyCardsController
          edit={edit}
          handleAddVocabulary={handleAddVocabulary}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

export default VocabCardsInput;
