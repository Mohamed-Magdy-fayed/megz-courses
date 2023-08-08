import { Typography } from "@mui/material";
import {
  useControlledPracticeMultichoiceStore,
} from "@/zustand/store";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import TextToSpeech from "@/components/TextToSpeech";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Question } from "@prisma/client";

const QuestionCard = ({ question }: { question: Question }) => {
  const { setAnswer, questions, submission } =
    useControlledPracticeMultichoiceStore();
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    const stateQuestion = questions.filter((q) => q.id === question.id)[0];
    const value = stateQuestion?.correctAnswer === stateQuestion?.studentAnswer;
    setIsCorrect(value);
  }, [submission]);

  return (
    <div className="w-full select-none">
      <RadioGroup
        onValueChange={(e) => setAnswer(question, e)}
        className="flex flex-col gap-0"
      >
        <TextToSpeech text={question.question}>
          <Typography
            className={cn(
              "",
              submission.completed
                ? isCorrect
                  ? "text-success"
                  : "text-warning"
                : "text-black"
            )}
          >
            {question.question}
          </Typography>
        </TextToSpeech>
        {question.choices.map((choice) => (
          <div key={choice} className="flex items-center gap-2">
            <RadioGroupItem
              checked={
                questions.filter((q) => q.id === question.id)[0]
                  ?.studentAnswer === choice
              }
              value={choice}
              id={question.question + choice}
              className="peer border-blue-300 bg-blue-300 text-blue-300 aria-checked:border-primary aria-checked:bg-primary aria-checked:text-primary"
            />
            <Label
              htmlFor={question.question + choice}
              className="cursor-pointer peer-aria-checked:text-primary"
            >
              <TextToSpeech text={choice}>{choice}</TextToSpeech>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default QuestionCard;
