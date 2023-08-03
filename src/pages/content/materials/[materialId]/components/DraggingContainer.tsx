import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import DraggableCard from "./DraggableCard";
import DropArea from "./DropArea";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Card, useDraggingStore, useToastStore } from "@/zustand/store";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import Image from "next/image";
import { useStore } from "zustand";
import Spinner from "@/components/Spinner";

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

  // const [mounted, setMounted] = useState(false);

  // useEffect(() => {
  //   setMounted(true);
  // }, []);

  // if (!mounted) return <Spinner />;

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

export default DraggingContainer;
