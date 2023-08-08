import AppLayout from "@/layouts/AppLayout";
import { Typography } from "@mui/material";
import { useDraggingStore } from "@/zustand/store";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import Spinner from "@/components/Spinner";
import TeachingContainer from "@/components/materialsShowcaseComponents/TeachingContainer";
import ControlledPracticeContainer from "@/components/materialsShowcaseComponents/ControlledPracticeContainer";
import FirstTestContainer from "@/components/materialsShowcaseComponents/FirstTestContainer";
import { api } from "@/lib/api";
import { useRouter } from "next/router";

const MaterialShowcasePage = () => {
  const { submission } = useDraggingStore();
  const router = useRouter();
  const id = router.query.materialId as string;
  const { data, isLoading, isError } = api.materials.getById.useQuery({ id });

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

  if (isLoading)
    return (
      <AppLayout>
        <Spinner></Spinner>
      </AppLayout>
    );

  if (isError) return <AppLayout>Error!</AppLayout>;

  const {
    leadinText,
    leadinImageUrl,
    title,
    subTitle,
    firstTestTitle,
    answerCards,
    answerAreas,
    vocabularyCards,
    practiceQuestions,
  } = data.materialItem!;

  return (
    <AppLayout>
      <div className="flex flex-col items-center p-4">
        <Typography className="text-center text-2xl font-bold">
          {leadinText}
        </Typography>
        <img src={leadinImageUrl} />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center whitespace-nowrap p-4">
          <Typography className="w-full text-left text-4xl font-bold text-cyan-600">
            {title}
          </Typography>
          <Typography className="w-full text-left text-base text-warning">
            {subTitle}
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
        <Typography className="text-center text-2xl font-bold">{}</Typography>
        <div className="flex flex-col gap-4">
          <FirstTestContainer
            DBcards={answerCards}
            DBareas={answerAreas}
            firstTestTitle={firstTestTitle}
          />
          <TeachingContainer vocabularyCards={vocabularyCards} />
          <ControlledPracticeContainer practiceQuestions={practiceQuestions} />
        </div>
      </div>
    </AppLayout>
  );
};

export default MaterialShowcasePage;
