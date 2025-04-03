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
import VocabularyCardsController, {
  VocabCard,
} from "./VocabularyCardController";
import { Typography } from "@/components/ui/Typoghraphy";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MaterialsFormValues } from "../MaterialsForm";

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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={"icon"}
                    customeColor={"infoIcon"}
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
                          .vocabularyCards.filter(
                            (c) => c.word !== vocabCard.word
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
