import AppLayout from "@/layouts/AppLayout";
import { Typography } from "@mui/material";
import { Card, useDraggingStore, useToastStore } from "@/zustand/store";
import { cn } from "@/lib/utils";
import { FC, ReactNode, useEffect, useState } from "react";
import Spinner from "@/components/Spinner";
import { useStore } from "zustand";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const MaterialShowcasePage = () => {
  const { submission } = useDraggingStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted)
    return (
      <AppLayout>
        <Spinner />
      </AppLayout>
    );

  return (
    <AppLayout>
      <div className="flex flex-col items-center p-4">
        <Typography className="text-center text-2xl font-bold">
          What are the advantages and disadvantages of staying in a hotel?
        </Typography>
        <img src="/sessionImages/Picture1.jpg" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center whitespace-nowrap p-4">
          <Typography className="w-full text-left text-4xl font-bold text-cyan-600">
            1- Vocab Time
          </Typography>
          <Typography className="w-full text-left text-base text-warning">
            Staying in Hotels
          </Typography>
        </div>
        {submission.completed && (
          <div className="flex flex-col gap-2 whitespace-nowrap p-4 [&>*]:text-sm">
            <Typography
              className={cn(
                "",
                submission.highestScore > 50 ? "text-success" : "text-error"
              )}
            >
              HighestScore: {submission.highestScore.toFixed(2)}%
            </Typography>
            <Typography>Attempts: {submission.attempts}</Typography>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center p-4">
        <Typography className="text-center text-2xl font-bold">
          Match the word with the picture.
        </Typography>
        <div className="flex flex-col gap-4">
          <DraggingContainer />
        </div>
      </div>
    </AppLayout>
  );
};

export default MaterialShowcasePage;

const DraggingContainer = () => {
  const {
    setSelectedCard,
    cards,
    usedCards,
    areas,
    selectedCard,
    addSelection,
    addUsedCard,
    clearAnswers,
    submit,
  } = useStore(useDraggingStore);
  const toast = useToastStore();

  const handleTestSubmit = () => {
    submit();
    const correctAnswers = areas.filter(
      (area) => area.card?.id === area.correctAnswer
    ).length;
    correctAnswers < areas.length / 2
      ? toast.error(
          `Correct answers: ${correctAnswers} out of ${
            areas.length
          } - Score: ${((correctAnswers / areas.length) * 100).toFixed(2)}%`
        )
      : toast.success(
          `Correct answers: ${correctAnswers} out of ${
            areas.length
          } -  Score: ${((correctAnswers / areas.length) * 100).toFixed(2)}%`
        );
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => {
              const selection = selectedCard?.name === card.name ? null : card;
              const isUsed = usedCards.filter(
                (Ncard) => Ncard.id === card.id
              )[0]
                ? true
                : false;
              !isUsed && setSelectedCard(selection);
            }}
          >
            <DraggableCard
              key={card.name}
              card={card}
              isSelected={selectedCard?.name === card.name}
            />
          </div>
        ))}
      </div>
      <Button
        className="lg:w-fit"
        variant="destructive"
        onClick={() => clearAnswers()}
      >
        Clear answers <Trash className="ml-2 h-4 w-4" />
      </Button>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 [&>*]:cursor-pointer [&>*]:rounded-md [&>*]:border [&>*]:text-xl [&>*]:transition-all [&>*]:duration-300 hover:[&>*]:scale-105">
        {areas.map((area) => (
          <DropArea key={area.id} isCard={false} dropAreaId={area.id}>
            {area.card &&
              cards.find((item) => item.name === area.card?.name) && (
                <DraggableCard card={area.card} isInArea />
              )}
            {selectedCard ? (
              <Image
                onClick={() => {
                  addSelection(selectedCard, area.id);
                  addUsedCard(selectedCard);
                  setSelectedCard(null);
                }}
                height={5000}
                width={5000}
                src={area.img}
                alt="alt"
                className="h-full object-cover"
              />
            ) : (
              <Dialog>
                <DialogTrigger className="overflow-hidden rounded-md">
                  <Image
                    height={5000}
                    width={5000}
                    src={area.img}
                    alt="alt"
                    className="h-full object-cover"
                  />
                </DialogTrigger>
                <DialogContent>
                  <Image height={5000} width={5000} src={area.img} alt="alt" />
                </DialogContent>
              </Dialog>
            )}
          </DropArea>
        ))}
      </div>
      <Button className="lg:w-fit" onClick={handleTestSubmit}>
        Submit
      </Button>
    </>
  );
};

interface DropAreaProps {
  isCard: boolean;
  dropAreaId: string;
  children: ReactNode;
}
const DropArea = ({ isCard, dropAreaId, children }: DropAreaProps) => {
  const { areas, removeSelection } = useDraggingStore();

  return (
    <div className={cn("relative grid", isCard ? "" : "bg-white text-black")}>
      {children}
      {areas.filter((area) => area.id === dropAreaId)[0]?.card && (
        <Button
          onClick={() => {
            removeSelection(dropAreaId);
          }}
          variant="x"
          className="absolute right-2 top-2"
        >
          X
        </Button>
      )}
    </div>
  );
};

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
