import { FC, ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { SkipForward } from "lucide-react";
import { useTutorialStore } from "@/zustand/store";
import { Typography } from "../ui/Typoghraphy";

interface TutorialPopoverProps {
  isopen: boolean;
  children: ReactNode;
  content: ReactNode;
}

const TutorialPopover: FC<TutorialPopoverProps> = ({
  isopen,
  children,
  content,
}) => {
  const { setSkipTutorial } = useTutorialStore();

  return (
    <Popover open={isopen}>
      <PopoverTrigger
        asChild
        className={cn(
          "",
          isopen &&
          `relative before:absolute before:top-[10%] before:aspect-square before:h-[80%] before:animate-ping before:rounded-full before:bg-secondary/20 before:content-[""] after:absolute after:top-[10%] after:aspect-square after:h-[80%] after:animate-spin after:rounded-full after:border-2 after:border-b-0 after:border-r-0 after:border-t-0 after:border-primary after:bg-secondary/20 after:content-[""]`
        )}
      >
        {children}
      </PopoverTrigger>
      <PopoverContent className="m-4 flex flex-col items-center">
        <div className="mx-4 mb-4 w-full text-left">{content}</div>
        <Button
          onClick={() => setSkipTutorial(true)}
          variant={"outline"}
          className="whitespace-nowrap text-slate-700"
        >
          <Typography>Skip tutorial</Typography>
          <SkipForward className="ml-2 h-4 w-4" />
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default TutorialPopover;
