import FlipCard from "./FlipCard";
import TextToSpeech from "../TextToSpeech";
import { FC } from "react";
import { Typography } from "../ui/Typoghraphy";

export interface VocabCard {
  word: string;
  context: string;
  example: string;
  images: { front: string; back: string };
}

interface TeachingContainerProps {
  vocabularyCards: VocabCard[];
}

const TeachingContainer: FC<TeachingContainerProps> = ({ vocabularyCards }) => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex w-full flex-col items-center whitespace-nowrap p-4">
          <Typography className="text-lg font-bold text-info">
            Vocabulary
          </Typography>
        </div>
      </div>
      <div className="grid auto-rows-fr grid-cols-1 gap-4 text-slate-50 lg:grid-cols-2">
        {vocabularyCards.map((card) => (
          <FlipCard
            key={card.word}
            front={
              <>
                <TextToSpeech text={card.context} className="text-white">
                  <Typography>{card.context}</Typography>
                </TextToSpeech>
                <img
                  className="h-full rounded-lg object-cover"
                  src={card.images.front}
                  alt={card.word}
                />
                <Typography className="text-xl font-bold text-slate-100">
                  Click to flip!
                </Typography>
              </>
            }
            back={
              <>
                <TextToSpeech text={card.example} className="text-white">
                  <Typography>{card.example}</Typography>
                </TextToSpeech>
                <img
                  className="h-full rounded-lg object-cover"
                  src={card.images.back}
                  alt={card.word}
                />
                <div className="relative flex w-full items-center justify-center">
                  <TextToSpeech text={card.word} className="text-white">
                    <Typography className="text-xl font-bold text-slate-100">
                      {card.word}
                    </Typography>
                  </TextToSpeech>
                </div>
              </>
            }
          />
        ))}
      </div>
    </div>
  );
};

export default TeachingContainer;
