import { Typography } from "@mui/material";
import FlipCard from "./FlipCard";
import TextToSpeech from "../TextToSpeech";

export interface VocabCard {
  word: string;
  context: string;
  example: string;
  images: { front: string; back: string };
}

const TeachingContainer = () => {
  const vocabCards: VocabCard[] = [
    {
      word: "Single Room",
      context: "What kind of rooms would you like?",
      example: "A single room , please.",
      images: {
        front: "/sessionImages/word1.jpg",
        back: "/sessionImages/word1.jpg",
      },
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex w-full flex-col items-center whitespace-nowrap p-4">
          <Typography className="text-lg font-bold text-info">
            Vocabulary
          </Typography>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {vocabCards.map((card) => (
          <FlipCard
            key={card.word}
            front={
              <>
                <TextToSpeech text={card.context} className="text-white">
                  <Typography>{card.context}</Typography>
                </TextToSpeech>
                <img
                  className="rounded-lg"
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
                  className="rounded-lg"
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