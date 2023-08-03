import { cn } from "@/lib/utils";
import { Typography } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { type Card, useDraggingStore } from "@/zustand/store";
import Spinner from "@/components/Spinner";

interface DraggableCardProps {
  card: Card;
  isInArea?: boolean;
  isSelected?: boolean;
}

const DraggableCard: FC<DraggableCardProps> = ({
  card,
  isInArea,
  isSelected,
}) => {
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

  // const [mounted, setMounted] = useState(false);

  // useEffect(() => {
  //   setMounted(true);
  // }, []);

  // if (!mounted) return <Spinner />;

  return (
    <div
      className={cn(
        "rounded",
        isUsed && "bg-cyan-100 hover:!scale-100 hover:!bg-cyan-100"
      )}
    >
      <Typography
        className={cn(
          "",
          isSelected ? "bg-cyan-100 hover:!bg-cyan-100" : "",
          isUsed && !isInArea
            ? "!cursor-not-allowed hover:!scale-100 hover:!bg-cyan-100"
            : "",
          isInArea
            ? "absolute top-0 flex w-full cursor-pointer items-center justify-between whitespace-nowrap border bg-slate-200 p-2 text-center text-xl transition-all duration-300"
            : "cursor-pointer whitespace-nowrap rounded-md border p-2 text-center text-xl transition-all duration-300 hover:scale-105 hover:bg-cyan-50",
          !isCorrect && submission.completed && "border-red-300",
          isCorrect && "border-green-300"
        )}
      >
        {card.name}
      </Typography>
    </div>
  );
};

export default DraggableCard;
