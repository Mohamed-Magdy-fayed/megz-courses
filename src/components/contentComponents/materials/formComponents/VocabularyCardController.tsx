import MaterialImageUpload from "@/components/ui/MaterialImageUpload";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { FC, useEffect, useState } from "react";

export interface AnswerCardFieldProps {
  edit: VocabCard;
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

export interface VocabCard {
  word: string;
  context: string;
  example: string;
  front: string;
  back: string;
}

const VocabularyCardsController: FC<AnswerCardFieldProps> = ({
  handleAddVocabulary,
  edit,
}) => {
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState<VocabCard>(edit);

  const changeHandler = (value: string, key: string) => {
    setCard((prev) => {
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  useEffect(() => setCard(edit), [edit]);

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
            variant="outline"
            customeColor="primaryOutlined"
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

export default VocabularyCardsController;
