import {
  AnswerArea as AnswerAreaType,
  AnswerCard as AnswerCardType,
  useDraggingStore,
} from "@/zustand/store";
import { useStore } from "zustand";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FC, useEffect } from "react";
import AnswerCard from "./AnswerCard";
import AnswerArea from "./AnswerArea";
import { Typography } from "../ui/Typoghraphy";
import { useToast } from "@/components/ui/use-toast";

interface FirstTestContainerProps {
  DBcards: AnswerCardType[];
  DBareas: AnswerAreaType[];
  firstTestTitle: string;
}

const FirstTestContainer: FC<FirstTestContainerProps> = ({
  DBcards,
  DBareas,
  firstTestTitle,
}) => {
  const {
    setSelectedCard,
    cards,
    setCards,
    areas,
    setAreas,
    usedCards,
    selectedCard,
    addSelection,
    addUsedCard,
    clearAnswers,
    submit,
  } = useStore(useDraggingStore);
  const { toastError, toastSuccess } = useToast()

  const handleTestSubmit = () => {
    submit();
    const correctAnswers = areas.filter(
      (area) => area.card?.text === area.correctAnswer
    ).length;

    correctAnswers < areas.length / 2
      ? toastError(`Correct answers: ${correctAnswers} out of ${areas.length} - Score: ${((correctAnswers / areas.length) * 100).toFixed(0)}%`)
      : toastSuccess(`Correct answers: ${correctAnswers} out of ${areas.length} - Score: ${((correctAnswers / areas.length) * 100).toFixed(0)}%`);
  };

useEffect(() => {
  setCards(DBcards);
  setAreas(DBareas);
  clearAnswers();
}, []);

return (
  <>
    <Typography className="text-center" variant={"primary"}>{firstTestTitle}</Typography>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.id}
          onClick={() => {
            const selection = selectedCard?.text === card.text ? null : card;
            const isUsed = usedCards.filter(
              (Ncard) => Ncard.id === card.id
            )[0]
              ? true
              : false;
            !isUsed && setSelectedCard(selection);
          }}
        >
          <AnswerCard
            key={card.text}
            card={card}
            isSelected={selectedCard?.text === card.text}
          />
        </div>
      ))}
    </div>
    <Button
      className="lg:w-fit"
      customeColor="destructive"
      onClick={() => clearAnswers()}
    >
      Clear answers <Trash className="ml-2 h-4 w-4" />
    </Button>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [&>*]:cursor-pointer [&>*]:rounded-md [&>*]:border [&>*]:text-xl [&>*]:transition-all [&>*]:duration-300 hover:[&>*]:scale-105">
      {areas.map((area) => (
        <AnswerArea key={area.img} isCard={false} answerAreaImage={area.img}>
          {area.card &&
            cards.find((item) => item.text === area.card?.text) && (
              <AnswerCard card={area.card} isInArea />
            )}
          {selectedCard ? (
            <Image
              onClick={() => {
                addSelection(selectedCard, area.img);
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
        </AnswerArea>
      ))}
    </div>
    <Button className="lg:w-fit" onClick={handleTestSubmit}>
      Submit
    </Button>
  </>
);
};

export default FirstTestContainer;
