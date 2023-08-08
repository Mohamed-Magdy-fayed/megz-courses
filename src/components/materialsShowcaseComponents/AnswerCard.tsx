import { Typography } from "@mui/material";
import { Card, useDraggingStore } from "@/zustand/store";
import { cn } from "@/lib/utils";
import { FC, useEffect, useState } from "react";
import TextToSpeech from "@/components/TextToSpeech";

interface AnswerCardProps {
  card: Card;
  isInArea?: boolean;
  isSelected?: boolean;
}

const AnswerCard: FC<AnswerCardProps> = ({ card, isInArea, isSelected }) => {
  const { usedCards, submission } = useDraggingStore();
  const [isUsed, setIsUsed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    setIsCorrect(
      submission.correctAreas.filter(
        (area) => area.correctAnswer === card.id
      )[0]
        ? true
        : false
    );
    setIsUsed(
      usedCards.filter((Ncard) => Ncard.id === card.id)[0] ? true : false
    );
  }, [usedCards, submission]);

  return (
    <div
      className={cn(
        "flex select-none items-center justify-center p-1",
        isInArea
          ? "cursor-default rounded-t bg-slate-300"
          : "cursor-pointer rounded bg-slate-100 hover:bg-blue-200",
        isSelected ? "bg-blue-200" : "",
        isUsed ? "cursor-not-allowed text-primary hover:bg-slate-100" : "",
        isCorrect
          ? "outline outline-1 outline-success"
          : "outline outline-1 outline-warning"
      )}
    >
      <TextToSpeech text={card.name}>
        <Typography className={cn("relative")}>{card.name}</Typography>
      </TextToSpeech>
    </div>
  );
};

export default AnswerCard;
