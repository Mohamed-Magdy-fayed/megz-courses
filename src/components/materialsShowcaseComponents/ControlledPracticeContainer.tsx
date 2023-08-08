import { Typography } from "@mui/material";
import {
  useControlledPracticeMultichoiceStore,
  useToastStore,
} from "@/zustand/store";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import QuestionCard from "./QuestionCard";
import { FC, useEffect } from "react";
import { Question } from "@prisma/client";

interface ControlledPracticeContainerProps {
  practiceQuestions: Question[];
}

const ControlledPracticeContainer: FC<ControlledPracticeContainerProps> = ({
  practiceQuestions,
}) => {
  const { clearAnswers, questions, submit, setQuestions } =
    useControlledPracticeMultichoiceStore();

  const toast = useToastStore();
  const handleSubmit = () => {
    submit();
    const correctAnswers = questions.filter(
      (q) => q.correctAnswer === q.studentAnswer
    ).length;

    correctAnswers >= questions.length / 2
      ? toast.success(
          `${correctAnswers} Correct answers of ${questions.length} - Score: ${(
            (correctAnswers / questions.length) *
            100
          ).toFixed(2)}`
        )
      : toast.error(
          `${correctAnswers} Correct answers of ${questions.length} - Score: ${(
            (correctAnswers / questions.length) *
            100
          ).toFixed(2)}`
        );
  };

  useEffect(() => {
    setQuestions(practiceQuestions);
  }, []);

  return (
    <div>
      <div className="relative flex w-full flex-col items-center justify-center gap-4">
        <div className="flex w-full flex-col items-center whitespace-nowrap">
          <Typography className="text-lg font-bold text-info">
            Practice
          </Typography>
          <Typography className="text-base font-normal text-secondary">
            Choose the correct answer
          </Typography>
        </div>
        <Button
          className="w-full lg:w-fit"
          variant="destructive"
          onClick={() => clearAnswers()}
        >
          Clear answers <Trash className="ml-2 h-4 w-4" />
        </Button>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {questions.map((question) => (
          <QuestionCard key={question.id} question={question} />
        ))}
      </div>
      <Button className="mt-8 w-full lg:w-fit" onClick={() => handleSubmit()}>
        Submit
      </Button>
    </div>
  );
};

export default ControlledPracticeContainer;
