import AppLayout from "@/layouts/AppLayout";
import { Typography } from "@mui/material";
import { useDraggingStore } from "@/zustand/store";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import Spinner from "@/components/Spinner";
import TeachingContainer from "@/components/materialsShowcaseComponents/TeachingContainer";
import ControlledPracticeContainer from "@/components/materialsShowcaseComponents/ControlledPracticeContainer";
import FirstTestContainer from "@/components/materialsShowcaseComponents/FirstTestContainer";

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
          <FirstTestContainer />
          <TeachingContainer />
          <ControlledPracticeContainer />
        </div>
      </div>
    </AppLayout>
  );
};

export default MaterialShowcasePage;
